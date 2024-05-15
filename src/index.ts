import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import {
  create_cell_status_actions,
  update_cell_status_settings
} from './cell_status_actions';

/**
 * Initialisation data for the jupyterlab_cell_status_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_cell_status_extension:plugin',
  description: 'A JupyterLab extension to display notebook cell status.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_cell_status_extension is activated!'
    );

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log(
            'jupyterlab_cell_status_extension:plugin: loading settings...'
          );
          const root = document.documentElement;
          const updateSettings = (): void => {
            update_cell_status_settings(settings, root);
          };
          updateSettings();
          console.log(
            'jupyterlab_cell_status_extension:plugin: loaded settings...'
          );
          // We can auto update the color
          settings.changed.connect(updateSettings);
          console.log(
            'jupyterlab_cell_status_extension settings loaded:',
            settings.composite
          );
          create_cell_status_actions(settings);
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for jupyterlab_cell_status_extension.',
            reason
          );
          create_cell_status_actions(null);
        });
    } else {
      create_cell_status_actions(null);
    }

    console.log('jupyterlab_cell_status_extension:plugin activated...');
  }
};

export default plugin;
