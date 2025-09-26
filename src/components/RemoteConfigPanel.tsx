import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import type { Value as ConfigValue } from 'firebase/remote-config';

const RemoteConfigPanel: React.FC = () => {
  const {
    isLoading,
    error,
    lastFetchTime,
    configs,
    fetchConfigs,
  } = useRemoteConfig();

  const formatConfigValue = (key: string, value: ConfigValue): { display: string; type: string; color: string } => {

    let displayValue = value.asString();
    let type = 'string';
    let color = 'default';

    // Determina il tipo e formatta il valore
    if (key.includes('enable_') || key.includes('_enabled') || key === 'enable_notifications' || key === 'enable_presence_status') {
      type = 'boolean';
      displayValue = value.asBoolean() ? 'true' : 'false';
      color = value.asBoolean() ? 'success' : 'error';
    } else if (key.includes('_length') || key.includes('_interval') || key.includes('_size') || key.includes('max_')) {
      type = 'number';
      displayValue = value.asNumber().toLocaleString();
      color = 'info';
    } else if (key.includes('color') || key.includes('_color')) {
      type = 'color';
      color = 'secondary';
    } else if (key.includes('flags') || key.startsWith('{') || key.startsWith('[')) {
      type = 'json';
      try {
        const parsed = JSON.parse(value.asString());
        displayValue = JSON.stringify(parsed, null, 2);
        color = 'primary';
      } catch {
        // Keep as string if JSON parsing fails
      }
    }

    return { display: displayValue, type, color };
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'remote':
        return <SettingsIcon fontSize="small" />;
      case 'default':
        return <InfoIcon fontSize="small" />;
      case 'static':
        return <CodeIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'remote':
        return 'success';
      case 'default':
        return 'warning';
      case 'static':
        return 'info';
      default:
        return 'default';
    }
  };

  // Raggruppa le configurazioni per categoria
  const groupedConfigs = React.useMemo(() => {
    const groups: Record<string, Array<[string, ConfigValue]>> = {
      'UI & Theme': [],
      'Features': [],
      'Limits & Settings': [],
      'Messages & Text': [],
      'Other': []
    };

    Object.entries(configs).forEach(([key, value]) => {
      if (key.includes('color') || key.includes('theme') || key.includes('title')) {
        groups['UI & Theme'].push([key, value]);
      } else if (key.includes('enable_') || key.includes('feature_flags')) {
        groups['Features'].push([key, value]);
      } else if (key.includes('max_') || key.includes('_length') || key.includes('_interval')) {
        groups['Limits & Settings'].push([key, value]);
      } else if (key.includes('message') || key.includes('welcome')) {
        groups['Messages & Text'].push([key, value]);
      } else {
        groups['Other'].push([key, value]);
      }
    });

    // Rimuovi gruppi vuoti
    return Object.fromEntries(
      Object.entries(groups).filter(([, items]) => items.length > 0)
    );
  }, [configs]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchConfigs}
          startIcon={<RefreshIcon />}
        >
          Riprova
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Remote Config
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastFetchTime && (
            <Typography variant="body2" color="textSecondary">
              Ultimo aggiornamento: {lastFetchTime.toLocaleTimeString()}
            </Typography>
          )}
          <Tooltip title="Aggiorna configurazioni">
            <IconButton
              onClick={fetchConfigs}
              disabled={isLoading}
              color="primary"
            >
              {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" color="primary">
              {Object.keys(configs).length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configurazioni totali
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="success.main">
              {Object.values(configs).filter(v => v.getSource() === 'remote').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Da server remoto
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="warning.main">
              {Object.values(configs).filter(v => v.getSource() === 'default').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Valori di default
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Configuration Groups */}
      {Object.entries(groupedConfigs).map(([groupName, items]) => (
        <Card key={groupName} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon fontSize="small" />
              {groupName}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(([key, value]) => {
                const formatted = formatConfigValue(key, value);
                const source = value.getSource();

                return (
                  <Box key={key} sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.50' }
                  }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                          {key}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={source}
                            size="small"
                            color={getSourceColor(source)}
                            icon={getSourceIcon(source)}
                          />
                          <Chip
                            label={formatted.type}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Box>
                        {formatted.type === 'json' ? (
                          <Box
                            component="pre"
                            sx={{
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              overflow: 'auto',
                              maxHeight: 200,
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatted.display}
                          </Box>
                        ) : formatted.type === 'color' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: formatted.display,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: '50%',
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              {formatted.display}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: formatted.type === 'number' || formatted.type === 'boolean' ? 'monospace' : 'inherit',
                              color: formatted.type === 'boolean' ?
                                (formatted.display === 'true' ? 'success.main' : 'error.main') :
                                'text.primary'
                            }}
                          >
                            {formatted.display}
                          </Typography>
                        )}
                      </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      ))}

      {Object.keys(configs).length === 0 && !isLoading && (
        <Alert severity="info">
          Nessuna configurazione trovata. Assicurati di aver configurato Remote Config nella Firebase Console.
        </Alert>
      )}
    </Box>
  );
};

export default RemoteConfigPanel;
