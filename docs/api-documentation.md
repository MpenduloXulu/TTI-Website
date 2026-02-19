// API Documentation
// This file documents all available API endpoints

module.exports = {
  basePath: '/api',
  
  auth: {
    register: {
      method: 'POST',
      path: '/auth/register',
      description: 'User registration',
      public: true,
      body: {
        email: 'string (required)',
        password: 'string (required)',
        firstName: 'string (required)',
        lastName: 'string (required)',
        role: 'string (optional, default: applicant)'
      },
      response: {
        message: 'string',
        user: 'object',
        token: 'string'
      }
    },
    login: {
      method: 'POST',
      path: '/auth/login',
      description: 'User login',
      public: true,
      body: {
        email: 'string (required)',
        password: 'string (required)'
      },
      response: {
        message: 'string',
        user: 'object',
        token: 'string'
      }
    },
    getProfile: {
      method: 'GET',
      path: '/auth/profile',
      description: 'Get user profile',
      public: false,
      auth: 'required',
      response: {
        message: 'string',
        user: 'object'
      }
    },
    updateProfile: {
      method: 'PUT',
      path: '/auth/profile',
      description: 'Update user profile',
      public: false,
      auth: 'required',
      body: {
        firstName: 'string (optional)',
        lastName: 'string (optional)',
        phoneNumber: 'string (optional)',
        organization: 'string (optional)',
        department: 'string (optional)',
        profilePicture: 'string (optional)'
      },
      response: {
        message: 'string',
        data: 'object'
      }
    },
    logout: {
      method: 'POST',
      path: '/auth/logout',
      description: 'User logout',
      public: false,
      auth: 'required',
      response: {
        message: 'string'
      }
    }
  },

  funding: {
    create: {
      method: 'POST',
      path: '/funding',
      description: 'Create funding call',
      public: false,
      auth: 'required',
      role: 'admin',
      body: {
        title: 'string (required)',
        description: 'string (required)',
        fundingType: 'string (required)',
        totalBudget: 'number (required)',
        fundingPerApplication: 'number (required)',
        openingDate: 'timestamp (required)',
        closingDate: 'timestamp (required)',
        eligibilityCriteria: 'array (optional)',
        requiredDocuments: 'array (optional)',
        maxApplicationsPerApplicant: 'number (optional)'
      }
    },
    getAll: {
      method: 'GET',
      path: '/funding',
      description: 'Get all funding calls',
      public: true,
      query: {
        status: 'string (optional)',
        sortBy: 'string (optional)'
      }
    },
    getById: {
      method: 'GET',
      path: '/funding/:fundingCallId',
      description: 'Get funding call by ID',
      public: true
    },
    update: {
      method: 'PUT',
      path: '/funding/:fundingCallId',
      description: 'Update funding call',
      public: false,
      auth: 'required',
      role: 'admin'
    },
    publish: {
      method: 'POST',
      path: '/funding/:fundingCallId/publish',
      description: 'Publish funding call',
      public: false,
      auth: 'required',
      role: 'admin'
    },
    delete: {
      method: 'DELETE',
      path: '/funding/:fundingCallId',
      description: 'Delete funding call',
      public: false,
      auth: 'required',
      role: 'admin'
    }
  },

  applications: {
    submit: {
      method: 'POST',
      path: '/applications',
      description: 'Submit application',
      public: false,
      auth: 'required',
      body: {
        fundingCallId: 'string (required)',
        formData: 'object (required)',
        documents: 'array (optional)'
      }
    },
    getAll: {
      method: 'GET',
      path: '/applications',
      description: 'Get applications',
      public: false,
      auth: 'required',
      query: {
        fundingCallId: 'string (optional)',
        status: 'string (optional)',
        applicantId: 'string (optional)'
      }
    },
    getById: {
      method: 'GET',
      path: '/applications/:applicationId',
      description: 'Get application by ID',
      public: false,
      auth: 'required'
    },
    update: {
      method: 'PUT',
      path: '/applications/:applicationId',
      description: 'Update application',
      public: false,
      auth: 'required',
      role: 'admin'
    },
    assignReviewer: {
      method: 'POST',
      path: '/applications/:applicationId/assign-reviewer',
      description: 'Assign reviewer to application',
      public: false,
      auth: 'required',
      role: 'admin',
      body: {
        reviewerId: 'string (required)'
      }
    }
  },

  reviews: {
    submit: {
      method: 'POST',
      path: '/reviews',
      description: 'Submit review',
      public: false,
      auth: 'required',
      role: 'reviewer',
      body: {
        applicationId: 'string (required)',
        fundingCallId: 'string (optional)',
        overallScore: 'number (required)',
        criteria: 'array (optional)',
        generalComments: 'string (optional)',
        recommendation: 'string (required)'
      }
    },
    getAll: {
      method: 'GET',
      path: '/reviews',
      description: 'Get reviews',
      public: false,
      auth: 'required',
      query: {
        applicationId: 'string (optional)',
        status: 'string (optional)'
      }
    },
    getById: {
      method: 'GET',
      path: '/reviews/:reviewId',
      description: 'Get review by ID',
      public: false,
      auth: 'required'
    },
    getAssigned: {
      method: 'GET',
      path: '/reviews/assigned/list',
      description: 'Get assigned reviews for reviewer',
      public: false,
      auth: 'required',
      role: 'reviewer',
      query: {
        status: 'string (optional)'
      }
    }
  }
};
