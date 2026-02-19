// Firebase service class for authentication and database operations
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  deleteUser
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "./firebase";

class FirebaseService {
  // ===== Authentication Methods =====

  /**
   * Register a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} userData - Additional user data (name, role, etc.)
   * @returns {Promise<{user, uid}>} User object with uid
   */
  static async registerUser(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      const firstName = (userData.firstName || "").trim();
      const lastName = (userData.lastName || "").trim();
      const role = (userData.role || "applicant").toLowerCase();
      const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();

      // Update user profile with display name
      if (displayName || userData.name) {
        await updateProfile(user, { displayName: displayName || userData.name });
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        name: displayName || userData.name || "",
        role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        phone: userData.phone || "",
        organization: userData.organization || ""
      });

      return { user, uid: user.uid };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, uid}>} User object with uid
   */
  static async loginUser(email, password) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      return { user, uid: user.uid };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  static async logoutUser() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<user|null>} Current user or null
   */
  static async getCurrentUser() {
    return new Promise((resolve, reject) => {
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      } catch (error) {
        reject(new Error(`Failed to get current user: ${error.message}`));
      }
    });
  }

  /**
   * Listen to authentication state changes
   * @param {function} callback - Function to call when auth state changes
   * @returns {function} Unsubscribe function
   */
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  static async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  // ===== User Profile Methods =====

  /**
   * Get user profile data
   * @param {string} uid - User ID
   * @returns {Promise<object>} User profile data
   */
  static async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      throw new Error("User profile not found");
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Update user profile
   * @param {string} uid - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateUserProfile(uid, updates) {
    try {
      await updateDoc(doc(db, "users", uid), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  /**
   * Delete the currently authenticated user's account and profile document
   * @returns {Promise<void>}
   */
  static async deleteUserAccount() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const uid = currentUser.uid;

    try {
      await deleteUser(currentUser);
      await deleteDoc(doc(db, "users", uid));
    } catch (error) {
      if (error?.code === "auth/requires-recent-login") {
        throw new Error("Please sign in again before deleting your account.");
      }
      throw new Error(`Failed to delete user account: ${error.message}`);
    }
  }

  // ===== Funding Calls Methods =====

  /**
   * Get all funding calls
   * @param {object} filters - Filter criteria (status, category, etc.)
   * @returns {Promise<array>} Array of funding calls
   */
  static async getFundingCalls(filters = {}) {
    try {
      let q = collection(db, "fundingCalls");
      const queryConstraints = [];

      if (filters.status) {
        queryConstraints.push(where("status", "==", filters.status));
      }
      if (filters.category) {
        queryConstraints.push(where("category", "==", filters.category));
      }

      const finalQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(finalQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get funding calls: ${error.message}`);
    }
  }

  /**
   * Get single funding call
   * @param {string} fundingId - Funding call ID
   * @returns {Promise<object>} Funding call data
   */
  static async getFundingCall(fundingId) {
    try {
      const fundingDoc = await getDoc(doc(db, "fundingCalls", fundingId));
      if (fundingDoc.exists()) {
        return { id: fundingDoc.id, ...fundingDoc.data() };
      }
      throw new Error("Funding call not found");
    } catch (error) {
      throw new Error(`Failed to get funding call: ${error.message}`);
    }
  }

  // ===== Funding Opportunities Methods =====

  /**
   * Fetch all bursary opportunities for admin management
   * @returns {Promise<array>} Array of bursary opportunities
   */
  static async getBursaryOpportunities() {
    try {
      const bursaryCollection = collection(db, "bursaryOpportunities");
      let snapshot;

      try {
        const orderedQuery = query(bursaryCollection, orderBy("createdAt", "desc"));
        snapshot = await getDocs(orderedQuery);
      } catch (orderError) {
        console.warn("Falling back to unordered bursary fetch due to createdAt ordering issue:", orderError);
        snapshot = await getDocs(bursaryCollection);
      }

      const opportunities = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));

      return opportunities.sort((a, b) => {
        const normalise = (value) => {
          if (!value) return 0;
          if (typeof value?.toMillis === "function") return value.toMillis();
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };
        return normalise(b.createdAt) - normalise(a.createdAt);
      });
    } catch (error) {
      throw new Error(`Failed to fetch bursary opportunities: ${error.message}`);
    }
  }

  /**
   * Create a new bursary opportunity entry
   * @param {object} bursaryData - Opportunity payload
   * @returns {Promise<string>} Created document id
   */
  static async createBursaryOpportunity(bursaryData) {
    try {
      const docRef = await addDoc(collection(db, "bursaryOpportunities"), {
        ...bursaryData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create bursary opportunity: ${error.message}`);
    }
  }

  /**
   * Update existing bursary opportunity
   * @param {string} bursaryId - Document id
   * @param {object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateBursaryOpportunity(bursaryId, updates) {
    try {
      await updateDoc(doc(db, "bursaryOpportunities", bursaryId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Failed to update bursary opportunity: ${error.message}`);
    }
  }

  /**
   * Delete bursary opportunity
   * @param {string} bursaryId - Document id
   * @returns {Promise<void>}
   */
  static async deleteBursaryOpportunity(bursaryId) {
    try {
      await deleteDoc(doc(db, "bursaryOpportunities", bursaryId));
    } catch (error) {
      throw new Error(`Failed to delete bursary opportunity: ${error.message}`);
    }
  }

  // ===== Applications Methods =====

  /**
   * Get user's applications
   * @param {string} uid - User ID
   * @returns {Promise<array>} Array of applications
   */
  static async getUserApplications(uid) {
    try {
      const q = query(
        collection(db, "applications"),
        where("applicantId", "==", uid)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get applications: ${error.message}`);
    }
  }

  /**
   * Fetch a saved draft for a user and opportunity
   * @param {string} uid - User ID
   * @param {string} opportunityId - Funding opportunity ID
   * @returns {Promise<object|null>} Draft data or null if not found
   */
  static async getApplicationDraft(uid, opportunityId) {
    if (!uid || !opportunityId) {
      throw new Error("Draft lookup requires user and opportunity identifiers");
    }

    try {
      const draftId = `${uid}_${opportunityId}`;
      const draftDoc = await getDoc(doc(db, "applicationDrafts", draftId));
      if (!draftDoc.exists()) {
        return null;
      }
      return { id: draftDoc.id, ...draftDoc.data() };
    } catch (error) {
      throw new Error(`Failed to load application draft: ${error.message}`);
    }
  }

  /**
   * Persist an in-progress application draft
   * @param {string} uid - User ID
   * @param {string} opportunityId - Funding opportunity ID
   * @param {object} draftData - Draft payload
   * @returns {Promise<void>}
   */
  static async saveApplicationDraft(uid, opportunityId, draftData = {}) {
    if (!uid || !opportunityId) {
      throw new Error("Draft saving requires user and opportunity identifiers");
    }

    try {
      const draftId = `${uid}_${opportunityId}`;
      await setDoc(
        doc(db, "applicationDrafts", draftId),
        {
          uid,
          opportunityId,
          responses: draftData.responses || {},
          attachments: draftData.attachments || [],
          updatedAt: Timestamp.now()
        },
        { merge: true }
      );
    } catch (error) {
      throw new Error(`Failed to save application draft: ${error.message}`);
    }
  }

  /**
   * Remove an existing application draft
   * @param {string} uid - User ID
   * @param {string} opportunityId - Funding opportunity ID
   * @returns {Promise<void>}
   */
  static async deleteApplicationDraft(uid, opportunityId) {
    if (!uid || !opportunityId) {
      throw new Error("Draft deletion requires user and opportunity identifiers");
    }

    try {
      const draftId = `${uid}_${opportunityId}`;
      await deleteDoc(doc(db, "applicationDrafts", draftId));
    } catch (error) {
      throw new Error(`Failed to delete application draft: ${error.message}`);
    }
  }

  static async readFileAsBase64(file) {
    if (!file) {
      throw new Error("File is required for base64 conversion");
    }

    if (typeof FileReader === "undefined") {
      throw new Error("FileReader API is not available in this environment");
    }

    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") {
            reject(new Error("Unsupported file result type"));
            return;
          }

          const base64Section = result.split(",")[1];
          if (!base64Section) {
            reject(new Error("Failed to extract base64 content from file"));
            return;
          }

          resolve(base64Section);
        };
        reader.onerror = () => reject(new Error("Failed to read file for base64 conversion"));
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error(`Base64 conversion failed: ${error.message}`));
      }
    });
  }

  /**
   * Upload a supporting document to Firebase Storage
   * @param {string} uid - User ID
   * @param {string} opportunityId - Funding opportunity ID
   * @param {File} file - File to upload
   * @returns {Promise<object>} Metadata for the uploaded file
   */
  static async uploadSupportingDocument(uid, opportunityId, file) {
    if (!uid || !opportunityId || !file) {
      throw new Error("File upload requires user, opportunity, and file data");
    }

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `applications/${uid}/${opportunityId}/${Date.now()}-${safeName}`;
      const storageRef = ref(storage, storagePath);
      const base64Content = await FirebaseService.readFileAsBase64(file);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const downloadURL = await getDownloadURL(storageRef);

      return {
        name: file.name,
        url: downloadURL,
        path: storagePath,
        size: file.size,
        contentType: file.type || "application/octet-stream",
        base64: base64Content,
        uploadedAt: Timestamp.now()
      };
    } catch (error) {
      throw new Error(`Failed to upload supporting document: ${error.message}`);
    }
  }

  /**
   * Delete a supporting document from Firebase Storage
   * @param {string} storagePath - Path to the file in storage
   * @returns {Promise<void>}
   */
  static async deleteSupportingDocument(storagePath) {
    if (!storagePath) {
      throw new Error("Storage path required for deletion");
    }

    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (error) {
      throw new Error(`Failed to delete supporting document: ${error.message}`);
    }
  }

  /**
   * Get all applications for admin oversight
   * @returns {Promise<array>} Array of applications
   */
  static async getAllApplications() {
    try {
      const appsQuery = query(
        collection(db, "applications"),
        orderBy("submittedAt", "desc")
      );
      const snapshot = await getDocs(appsQuery);

      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }
  }

  /**
   * Submit new application
   * @param {object} applicationData - Application data
   * @returns {Promise<{id, ...data}>} Created application
   */
  static async submitApplication(applicationData) {
    try {
      const docRef = await addDoc(collection(db, "applications"), {
        ...applicationData,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: "submitted"
      });

      return {
        id: docRef.id,
        ...applicationData
      };
    } catch (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }
  }

  /**
   * Update application
   * @param {string} applicationId - Application ID
   * @param {object} updates - Fields to update
   * @returns {Promise<void>}
   */
  static async updateApplication(applicationId, updates) {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  /**
   * Update application status and optional admin metadata
   * @param {string} applicationId - Application ID
   * @param {{status: string, adminNotes?: string, adminUserId?: string}} updates
   * @returns {Promise<void>}
   */
  static async updateApplicationStatus(applicationId, updates) {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  /**
   * Persist fund allocation details for approved applicants
   * @param {string} applicationId - Application ID
   * @param {{allocationAmount: number, allocationNotes?: string, allocatedBy?: string}} allocation
   * @returns {Promise<void>}
   */
  static async setFundAllocation(applicationId, allocation) {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        fundAllocation: {
          ...allocation,
          updatedAt: Timestamp.now()
        },
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Failed to save fund allocation: ${error.message}`);
    }
  }

  // ===== Reviews Methods =====

  /**
   * Submit a review
   * @param {object} reviewData - Review data
   * @returns {Promise<{id, ...data}>} Created review
   */
  static async submitReview(reviewData) {
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        ...reviewData,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return {
        id: docRef.id,
        ...reviewData
      };
    } catch (error) {
      throw new Error(`Failed to submit review: ${error.message}`);
    }
  }

  /**
   * Get application reviews
   * @param {string} applicationId - Application ID
   * @returns {Promise<array>} Array of reviews
   */
  static async getApplicationReviews(applicationId) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("applicationId", "==", applicationId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get reviews: ${error.message}`);
    }
  }

  // ===== Notifications Methods =====

  /**
   * Get user notifications
   * @param {string} uid - User ID
   * @returns {Promise<array>} Array of notifications
   */
  static async getNotifications(uid) {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", uid)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  /**
   * Create notification
   * @param {object} notificationData - Notification data
   * @returns {Promise<{id, ...data}>} Created notification
   */
  static async createNotification(notificationData) {
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notificationData,
        createdAt: Timestamp.now(),
        isRead: false
      });

      return {
        id: docRef.id,
        ...notificationData
      };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // ===== Batch Operations =====

  /**
   * Batch update documents
   * @param {array} updates - Array of {collection, docId, data}
   * @returns {Promise<void>}
   */
  static async batchUpdate(updates) {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ collectionName, docId, data }) => {
        const docRef = doc(db, collectionName, docId);
        batch.update(docRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Batch update failed: ${error.message}`);
    }
  }

  /**
   * Batch delete documents
   * @param {array} deletes - Array of {collection, docId}
   * @returns {Promise<void>}
   */
  static async batchDelete(deletes) {
    try {
      const batch = writeBatch(db);

      deletes.forEach(({ collectionName, docId }) => {
        const docRef = doc(db, collectionName, docId);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Batch delete failed: ${error.message}`);
    }
  }
}

export default FirebaseService;
