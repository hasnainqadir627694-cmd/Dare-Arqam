import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSingleAppState, saveSingleAppState, LeadershipState } from '../services/firebaseService';
import { 
  saveOfficialBrandingLogo, 
  updateBrowserIdentityTags, 
  DEFAULT_OFFICIAL_LOGO,
  LOCAL_STORAGE_LOGO_KEY 
} from '../services/brandingPersistenceService';

export const DEFAULT_CAMPUS_BANNER = '/src/assets/images/campus_main_building_1790434904126.jpg';
export const DEFAULT_PRINCIPAL_PHOTO = '/src/assets/images/principal_portrait_1790434918701.jpg';

export const DEFAULT_PRINCIPAL_NAME = 'Prof. Dr. Abdul Rahman Qureshi';
export const DEFAULT_PRINCIPAL_TITLE = 'Principal';
export const DEFAULT_PRINCIPAL_QUALIFICATION = 'Ph.D. in Educational Leadership & Curriculum Design';

export interface SocialMediaPlatformConfig {
  enabled: boolean;
  profileName: string;
  url: string;
  phoneNumber?: string;
  displayOrder: number;
}

export interface SocialMediaState {
  youtube: SocialMediaPlatformConfig;
  facebook: SocialMediaPlatformConfig;
  tiktok: SocialMediaPlatformConfig;
  whatsapp: SocialMediaPlatformConfig;
}

export const DEFAULT_SOCIAL_MEDIA_STATE: SocialMediaState = {
  youtube: {
    enabled: true,
    profileName: 'YouTube',
    url: 'https://youtube.com',
    displayOrder: 1,
  },
  facebook: {
    enabled: true,
    profileName: 'Facebook',
    url: 'https://facebook.com',
    displayOrder: 2,
  },
  tiktok: {
    enabled: true,
    profileName: 'TikTok',
    url: 'https://tiktok.com',
    displayOrder: 3,
  },
  whatsapp: {
    enabled: true,
    profileName: 'WhatsApp',
    phoneNumber: '+923001234567',
    url: 'https://wa.me/923001234567',
    displayOrder: 4,
  },
};

interface BrandingContextType {
  logoUrl: string | null;
  bannerUrl: string | null;
  institutionName: string;
  tagline: string;
  establishedYear: string;
  // Principal Portrait & Info
  principalPhotoUrl: string | null;
  principalName: string;
  principalTitle: string;
  principalQualification: string;
  principalMessage: string;

  // Social Media State
  socialMedia: SocialMediaState;

  // Actions
  updateLogo: (newLogoUrl: string | null) => Promise<void>;
  resetLogo: () => Promise<void>;
  updateBanner: (newBannerUrl: string | null) => Promise<void>;
  resetBanner: () => Promise<void>;
  updateBrandingDetails: (name: string, tag: string) => Promise<void>;

  updatePrincipalPhoto: (url: string | null) => Promise<void>;
  resetPrincipalPhoto: () => Promise<void>;
  updatePrincipalDetails: (details: Partial<LeadershipState>) => Promise<void>;
  updateSocialMedia: (newState: SocialMediaState) => Promise<void>;
}

const LOCAL_STORAGE_BANNER_KEY = 'dare_arqam_custom_banner';
const LOCAL_STORAGE_BRANDING_KEY = 'dare_arqam_branding_details';
const LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY = 'dare_arqam_principal_photo';
const LOCAL_STORAGE_LEADERSHIP_DETAILS_KEY = 'dare_arqam_leadership_details';
const LOCAL_STORAGE_SOCIAL_MEDIA_KEY = 'dare_arqam_social_media_settings';

const BrandingContext = createContext<BrandingContextType>({
  logoUrl: null,
  bannerUrl: null,
  institutionName: 'DAR - E - ARQAM',
  tagline: 'School Katlang Campus',
  establishedYear: '1998',
  principalPhotoUrl: null,
  principalName: DEFAULT_PRINCIPAL_NAME,
  principalTitle: DEFAULT_PRINCIPAL_TITLE,
  principalQualification: DEFAULT_PRINCIPAL_QUALIFICATION,
  principalMessage: '',
  socialMedia: DEFAULT_SOCIAL_MEDIA_STATE,
  updateLogo: async () => {},
  resetLogo: async () => {},
  updateBanner: async () => {},
  resetBanner: async () => {},
  updateBrandingDetails: async () => {},
  updatePrincipalPhoto: async () => {},
  resetPrincipalPhoto: async () => {},
  updatePrincipalDetails: async () => {},
  updateSocialMedia: async () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize synchronously from localStorage or official permanent project asset
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_LOGO_KEY);
      if (cached && cached.trim().length > 0) return cached;
    } catch {}
    return DEFAULT_OFFICIAL_LOGO;
  });

  const [bannerUrl, setBannerUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_BANNER_KEY) || null;
    } catch {
      return null;
    }
  });

  const [institutionName, setInstitutionName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BRANDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'DARE ARQAM') {
          return parsed.name;
        }
      }
    } catch {}
    return 'DAR - E - ARQAM';
  });

  const [tagline, setTagline] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BRANDING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tagline && parsed.tagline !== 'Official Educational Institution Portal') {
          return parsed.tagline;
        }
      }
    } catch {}
    return 'School Katlang Campus';
  });

  // Principal state
  const [principalPhotoUrl, setPrincipalPhotoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY) || null;
    } catch {
      return null;
    }
  });

  const [principalDetails, setPrincipalDetails] = useState<Partial<LeadershipState>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LEADERSHIP_DETAILS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      principalName: DEFAULT_PRINCIPAL_NAME,
      principalTitle: DEFAULT_PRINCIPAL_TITLE,
      principalQualification: DEFAULT_PRINCIPAL_QUALIFICATION,
    };
  });

  // Social Media state
  const [socialMedia, setSocialMedia] = useState<SocialMediaState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SOCIAL_MEDIA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SOCIAL_MEDIA_STATE,
          ...parsed,
          whatsapp: parsed.whatsapp || DEFAULT_SOCIAL_MEDIA_STATE.whatsapp,
        };
      }
    } catch {}
    return DEFAULT_SOCIAL_MEDIA_STATE;
  });

  // Sync with Single Document State on boot
  useEffect(() => {
    let isMounted = true;

    const fetchBrandingFromSingleDoc = async () => {
      try {
        const state = await fetchSingleAppState();
        if (state && isMounted) {
          if (state.branding) {
            const b = state.branding;
            if (b.logoUrl && typeof b.logoUrl === 'string' && b.logoUrl.trim().length > 0) {
              setLogoUrl(b.logoUrl);
              localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, b.logoUrl);
              updateBrowserIdentityTags(b.logoUrl);
            } else {
              updateBrowserIdentityTags(DEFAULT_OFFICIAL_LOGO);
            }
            if (b.bannerUrl && typeof b.bannerUrl === 'string' && b.bannerUrl.trim().length > 0) {
              setBannerUrl(b.bannerUrl);
              localStorage.setItem(LOCAL_STORAGE_BANNER_KEY, b.bannerUrl);
            }
            if (b.institutionName && b.institutionName !== 'DARE ARQAM') {
              setInstitutionName(b.institutionName);
            }
            if (b.tagline && b.tagline !== 'Official Educational Institution Portal') {
              setTagline(b.tagline);
            }
          }

          if (state.leadership) {
            const lead = state.leadership;
            if (lead.principalPhotoUrl !== undefined) {
              setPrincipalPhotoUrl(lead.principalPhotoUrl || null);
              if (lead.principalPhotoUrl) {
                localStorage.setItem(LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY, lead.principalPhotoUrl);
              } else {
                localStorage.removeItem(LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY);
              }
            }
            setPrincipalDetails(prev => {
              const updated = { ...prev, ...lead };
              try {
                localStorage.setItem(LOCAL_STORAGE_LEADERSHIP_DETAILS_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }

          if (state.socialMedia) {
            setSocialMedia(prev => {
              const merged = { ...DEFAULT_SOCIAL_MEDIA_STATE, ...state.socialMedia };
              try {
                localStorage.setItem(LOCAL_STORAGE_SOCIAL_MEDIA_KEY, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Could not sync branding from Firestore single doc:', err);
      }
    };

    fetchBrandingFromSingleDoc();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateLogo = async (newLogoUrl: string | null) => {
    if (!newLogoUrl) {
      setLogoUrl(DEFAULT_OFFICIAL_LOGO);
      try {
        localStorage.removeItem(LOCAL_STORAGE_LOGO_KEY);
      } catch {}
      updateBrowserIdentityTags(DEFAULT_OFFICIAL_LOGO);
      try {
        const currentState = await fetchSingleAppState() || {};
        await saveSingleAppState({
          ...currentState,
          branding: {
            ...(currentState.branding || {}),
            logoUrl: DEFAULT_OFFICIAL_LOGO,
            bannerUrl: bannerUrl || '',
            institutionName,
            tagline
          }
        });
      } catch {}
      return;
    }

    // Persist via permanent multi-tier service: static project assets + Firebase Storage + Firestore + DOM
    const res = await saveOfficialBrandingLogo(newLogoUrl);
    const finalUrl = res.url || newLogoUrl;
    setLogoUrl(finalUrl);
    updateBrowserIdentityTags(finalUrl);
  };

  const resetLogo = async () => {
    await updateLogo(null);
  };

  const updateBanner = async (newBannerUrl: string | null) => {
    setBannerUrl(newBannerUrl);
    try {
      if (newBannerUrl) {
        localStorage.setItem(LOCAL_STORAGE_BANNER_KEY, newBannerUrl);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_BANNER_KEY);
      }
    } catch {}

    try {
      const currentState = await fetchSingleAppState() || {};
      await saveSingleAppState({
        ...currentState,
        branding: {
          ...(currentState.branding || {}),
          logoUrl: logoUrl || '',
          bannerUrl: newBannerUrl || '',
          institutionName,
          tagline
        }
      });
    } catch {}
  };

  const resetBanner = async () => {
    await updateBanner(null);
  };

  const updateBrandingDetails = async (name: string, tag: string) => {
    setInstitutionName(name);
    setTagline(tag);
    try {
      localStorage.setItem(LOCAL_STORAGE_BRANDING_KEY, JSON.stringify({ name, tagline: tag }));
    } catch {}

    try {
      const currentState = await fetchSingleAppState() || {};
      await saveSingleAppState({
        ...currentState,
        branding: {
          ...(currentState.branding || {}),
          logoUrl: logoUrl || '',
          bannerUrl: bannerUrl || '',
          institutionName: name,
          tagline: tag
        }
      });
    } catch {}
  };

  // ----------------------------------------------------
  // Principal Portrait & Details Updates
  // ----------------------------------------------------
  const updatePrincipalPhoto = async (url: string | null) => {
    setPrincipalPhotoUrl(url);
    try {
      if (url) {
        localStorage.setItem(LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY, url);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_PRINCIPAL_PHOTO_KEY);
      }
    } catch {}

    try {
      const currentState = await fetchSingleAppState() || {};
      await saveSingleAppState({
        ...currentState,
        leadership: {
          ...(currentState.leadership || {}),
          principalPhotoUrl: url || '',
        }
      });
    } catch (e) {
      console.warn('Could not persist principal photo to single document:', e);
    }
  };

  const resetPrincipalPhoto = async () => {
    await updatePrincipalPhoto(null);
  };

  const updatePrincipalDetails = async (details: Partial<LeadershipState>) => {
    const updated = { ...principalDetails, ...details };
    setPrincipalDetails(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_LEADERSHIP_DETAILS_KEY, JSON.stringify(updated));
    } catch {}

    try {
      const currentState = await fetchSingleAppState() || {};
      await saveSingleAppState({
        ...currentState,
        leadership: {
          ...(currentState.leadership || {}),
          ...updated,
          principalPhotoUrl: principalPhotoUrl || '',
        }
      });
    } catch (e) {
      console.warn('Could not persist principal details to single document:', e);
    }
  };

  const updateSocialMedia = async (newState: SocialMediaState) => {
    setSocialMedia(newState);
    try {
      localStorage.setItem(LOCAL_STORAGE_SOCIAL_MEDIA_KEY, JSON.stringify(newState));
    } catch {}

    try {
      const currentState = await fetchSingleAppState() || {};
      await saveSingleAppState({
        ...currentState,
        socialMedia: newState,
      });
    } catch (e) {
      console.warn('Could not persist social media state to single document:', e);
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        logoUrl,
        bannerUrl,
        institutionName,
        tagline,
        establishedYear: '1998',
        principalPhotoUrl,
        principalName: principalDetails.principalName || DEFAULT_PRINCIPAL_NAME,
        principalTitle: principalDetails.principalTitle || DEFAULT_PRINCIPAL_TITLE,
        principalQualification: principalDetails.principalQualification || DEFAULT_PRINCIPAL_QUALIFICATION,
        principalMessage: principalDetails.principalMessage || '',
        socialMedia,
        updateLogo,
        resetLogo,
        updateBanner,
        resetBanner,
        updateBrandingDetails,
        updatePrincipalPhoto,
        resetPrincipalPhoto,
        updatePrincipalDetails,
        updateSocialMedia,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
