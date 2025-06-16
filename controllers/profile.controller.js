const { 
  createProfile, 
  getProfileByUserId,
  getProfileById,
  updateProfile,
  deleteProfile,
  getProfilesWithName
} = require('../models/profile');
const { v4: uuidv4 } = require('uuid');

module.exports.getProfilesWithName = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    // Validate search parameter
    if (search && typeof search !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Search parameter must be a string' 
      });
    }

    const profiles = await getProfilesWithName(search);
    
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No profiles found',
        profiles: []
      });
    }

    return res.json({ 
      success: true,
      count: profiles.length,
      profiles 
    });
  } catch (err) {
    console.error('Error in getProfilesWithName:', err);
    
    if (err.errorNum === 904) {
      return res.status(500).json({
        success: false,
        message: 'Database configuration error',
        details: 'Please contact support'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles'
    });
  }
};

module.exports.addProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const existingProfile = await getProfileByUserId(userId);
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profileId = uuidv4();
    await createProfile({
      id: profileId,
      user_id: userId,
      cvLanguage: profileData.cvLanguage || 'fr',
      description: profileData.description || null,
      experienceYears: profileData.experienceYears || null,
      langues: JSON.stringify(profileData.langues || {FR:false,IT:false,EN:false,DE:false,ES:false}),
      formations: JSON.stringify(profileData.formations || [{type:"",libelle:""}]),
      formations_en: JSON.stringify(profileData.formations_en || [{type:"",libelle:""}]),
      expSignificatives: JSON.stringify(profileData.expSignificatives || []),
      expSignificatives_en: JSON.stringify(profileData.expSignificatives_en || []),
      poste_id: profileData.poste_id || null,
      grade_id: profileData.grade_id || null,
      metier_id: profileData.metier_id || null,
      images: profileData.images || null
    });

    res.status(201).json({ 
      message: 'Profile created successfully',
      profileId 
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const formattedProfile = {
      ...profile,
      langues: profile.LANGUES ? JSON.parse(profile.LANGUES) : {},
      formations: profile.FORMATIONS ? JSON.parse(profile.FORMATIONS) : [],
      formations_en: profile.FORMATIONS_EN ? JSON.parse(profile.FORMATIONS_EN) : [],
      expSignificatives: profile.EXP_SIGNIFICATIVES ? JSON.parse(profile.EXP_SIGNIFICATIVES) : [],
      expSignificatives_en: profile.EXP_SIGNIFICATIVES_EN ? JSON.parse(profile.EXP_SIGNIFICATIVES_EN) : []
    };
    
    res.json(formattedProfile);
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const updated = await updateProfile(profile.ID, {
      ...req.body,
      langues: JSON.stringify(req.body.langues),
      formations: JSON.stringify(req.body.formations),
      formations_en: JSON.stringify(req.body.formations_en),
      expSignificatives: JSON.stringify(req.body.expSignificatives),
      expSignificatives_en: JSON.stringify(req.body.expSignificatives_en)
    });

    if (!updated) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const deleted = await deleteProfile(profile.ID);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete profile' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    next(err);
  }
};