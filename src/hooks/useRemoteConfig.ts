import { useEffect, useState, useCallback } from 'react';
import {
  fetchAndActivate,
  getValue,
  getAll
} from 'firebase/remote-config';
import type { Value as ConfigValue } from 'firebase/remote-config';
import { remoteConfig } from '../firebase';

interface RemoteConfigState {
  isLoading: boolean;
  error: string | null;
  lastFetchTime: Date | null;
  configs: Record<string, ConfigValue>;
}

export const useRemoteConfig = () => {
  const [state, setState] = useState<RemoteConfigState>({
    isLoading: true,
    error: null,
    lastFetchTime: null,
    configs: {},
  });

  // Configura le impostazioni di default per Remote Config
  const initializeRemoteConfig = useCallback(async () => {
    try {
      // Imposta i valori di default
      // const defaults = {
      //   app_title: 'Firebase Chat Workshop',
      //   max_message_length: 1000,
      //   enable_notifications: true,
      //   theme_primary_color: '#1976d2',
      //   feature_flags: JSON.stringify({
      //     enableVoiceMessages: false,
      //     enableFileSharing: true,
      //     enableGiphy: false,
      //     maxUploadSize: 10485760 // 10MB
      //   }),
      //   welcome_message: 'Benvenuto nella chat!',
      //   chat_refresh_interval: 5000,
      //   enable_presence_status: true,
      //   max_users_per_chat: 100,
      // };
      const defaults = {
        Nascondi_bottone: 'pippo'
      }

      // Configura Remote Config
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 30000, // 30 secondi per sviluppo
        fetchTimeoutMillis: 60000, // 1 minuto timeout
      };

      // Imposta i valori di default
      remoteConfig.defaultConfig = defaults;

      console.log('Remote Config initialized with defaults');
    } catch (error) {
      console.error('Error initializing Remote Config:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize Remote Config',
        isLoading: false
      }));
    }
  }, []);

  // Fetcha e attiva le configurazioni remote
  const fetchConfigs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch e attiva le nuove configurazioni
      const activated = await fetchAndActivate(remoteConfig);

      // Ottieni tutti i valori di configurazione
      const allConfigs = getAll(remoteConfig);
      console.log('allConfigs:', allConfigs);

      setState({
        isLoading: false,
        error: null,
        lastFetchTime: new Date(),
        configs: allConfigs,
      });

      console.log('Remote Config fetched and activated:', {
        activated,
        configCount: Object.keys(allConfigs).length,
      });

      return activated;
    } catch (error) {
      console.error('Error fetching Remote Config:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch remote configurations',
        isLoading: false
      }));
      return false;
    }
  }, []);

  // Ottieni un singolo valore di configurazione
  const getConfigValue = useCallback((key: string): ConfigValue | null => {
    try {
      return getValue(remoteConfig, key);
    } catch (error) {
      console.error(`Error getting config value for ${key}:`, error);
      return null;
    }
  }, []);

  // Ottieni un valore come stringa
  const getStringValue = useCallback((key: string, defaultValue = ''): string => {
    const value = getConfigValue(key);
    return value ? value.asString() : defaultValue;
  }, [getConfigValue]);

  // Ottieni un valore come numero
  const getNumberValue = useCallback((key: string, defaultValue = 0): number => {
    const value = getConfigValue(key);
    return value ? value.asNumber() : defaultValue;
  }, [getConfigValue]);

  // Ottieni un valore come booleano
  const getBooleanValue = useCallback((key: string, defaultValue = false): boolean => {
    const value = getConfigValue(key);
    return value ? value.asBoolean() : defaultValue;
  }, [getConfigValue]);

  // Ottieni un valore come oggetto JSON
  const getJSONValue = useCallback(<T = Record<string, unknown>>(key: string, defaultValue = {} as T): T => {
    const value = getConfigValue(key);
    if (!value) return defaultValue;

    try {
      return JSON.parse(value.asString());
    } catch (error) {
      console.error(`Error parsing JSON for ${key}:`, error);
      return defaultValue;
    }
  }, [getConfigValue]);

  // Inizializza Remote Config al mount
  useEffect(() => {
    const init = async () => {
      await initializeRemoteConfig();
      await fetchConfigs();
    };

    init();
  }, [initializeRemoteConfig, fetchConfigs]);

  return {
    ...state,
    fetchConfigs,
    getConfigValue,
    getStringValue,
    getNumberValue,
    getBooleanValue,
    getJSONValue,
  };
};
