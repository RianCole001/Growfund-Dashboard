import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsAPI';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    platformName: 'GrowFund',
    platformEmail: 'support@growfund.com',
    maintenanceMode: false,
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    depositFee: 0,
    withdrawalFee: 2,
    referralBonus: 50,
    minCapitalPlanInvestment: 500,
    minRealEstateInvestment: 1000,
    minCryptoInvestment: 50,
    // Capital Plan Individual Minimums
    capitalBasicMin: 30,
    capitalStandardMin: 60,
    capitalAdvanceMin: 100,
    // Real Estate Individual Minimums
    realEstateStarterMin: 1000,
    realEstatePremiumMin: 5000,
    realEstateLuxuryMin: 20000,
  });
  const [loading, setLoading] = useState(true);

  // Load public settings on app start
  useEffect(() => {
    loadPublicSettings();
    
    // Poll for settings updates every 30 seconds
    const interval = setInterval(() => {
      loadPublicSettings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPublicSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPublicSettings();
      
      console.log('🔧 Settings API Response:', data);
      
      if (data.success) {
        const publicSettings = data.data;
        console.log('📊 Public Settings Data:', publicSettings);
        
        // Log individual plan minimums specifically
        console.log('💰 Individual Plan Minimums from API:');
        console.log('  - capitalBasicMin:', publicSettings.capitalBasicMin);
        console.log('  - capitalStandardMin:', publicSettings.capitalStandardMin);
        console.log('  - capitalAdvanceMin:', publicSettings.capitalAdvanceMin);
        console.log('  - realEstateStarterMin:', publicSettings.realEstateStarterMin);
        console.log('  - realEstatePremiumMin:', publicSettings.realEstatePremiumMin);
        console.log('  - realEstateLuxuryMin:', publicSettings.realEstateLuxuryMin);
        
        const newSettings = {
          platformName: publicSettings.platformName || 'GrowFund',
          platformEmail: publicSettings.platformEmail || 'support@growfund.com',
          maintenanceMode: publicSettings.maintenanceMode || false,
          minDeposit: parseFloat(publicSettings.minDeposit) || 100,
          maxDeposit: parseFloat(publicSettings.maxDeposit) || 100000,
          minWithdrawal: parseFloat(publicSettings.minWithdrawal) || 50,
          maxWithdrawal: parseFloat(publicSettings.maxWithdrawal) || 50000,
          depositFee: parseFloat(publicSettings.depositFee) || 0,
          withdrawalFee: parseFloat(publicSettings.withdrawalFee) || 2,
          referralBonus: parseFloat(publicSettings.referralBonus) || 50,
          minCapitalPlanInvestment: parseFloat(publicSettings.minCapitalPlanInvestment) || 500,
          minRealEstateInvestment: parseFloat(publicSettings.minRealEstateInvestment) || 1000,
          minCryptoInvestment: parseFloat(publicSettings.minCryptoInvestment) || 50,
          // Capital Plan Individual Minimums
          capitalBasicMin: parseFloat(publicSettings.capitalBasicMin) || 30,
          capitalStandardMin: parseFloat(publicSettings.capitalStandardMin) || 60,
          capitalAdvanceMin: parseFloat(publicSettings.capitalAdvanceMin) || 100,
          // Real Estate Individual Minimums
          realEstateStarterMin: parseFloat(publicSettings.realEstateStarterMin) || 1000,
          realEstatePremiumMin: parseFloat(publicSettings.realEstatePremiumMin) || 5000,
          realEstateLuxuryMin: parseFloat(publicSettings.realEstateLuxuryMin) || 20000,
        };
        
        console.log('✅ Setting new settings:', newSettings);
        console.log('💰 Individual Plan Minimums in new settings:');
        console.log('  - capitalBasicMin:', newSettings.capitalBasicMin);
        console.log('  - capitalStandardMin:', newSettings.capitalStandardMin);
        console.log('  - capitalAdvanceMin:', newSettings.capitalAdvanceMin);
        console.log('  - realEstateStarterMin:', newSettings.realEstateStarterMin);
        console.log('  - realEstatePremiumMin:', newSettings.realEstatePremiumMin);
        console.log('  - realEstateLuxuryMin:', newSettings.realEstateLuxuryMin);
        
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('❌ Error loading public settings:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    loading,
    refreshSettings: loadPublicSettings,
    // Force refresh settings (useful after admin changes)
    forceRefresh: () => {
      setLoading(true);
      loadPublicSettings();
    }
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};