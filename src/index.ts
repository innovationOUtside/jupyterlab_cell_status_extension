import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { create_cell_status_actions } from './cell_status_actions';

/**
 * Initialization data for the jupyterlab_cell_status_extension extension.
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
            const queue_color = settings.get('status_queue')
              .composite as string;
            const success_color = settings.get('status_success')
              .composite as string;
            const error_color = settings.get('status_error')
              .composite as string;
            const flash_duration = settings.get('flash_duration')
              .composite as number;
            root.style.setProperty('--jp-cell-status-queue', queue_color);
            root.style.setProperty('--jp-cell-status-success', success_color);
            root.style.setProperty('--jp-cell-status-error', error_color);

            root.style.setProperty(
              '--jp-cell-flash-duration',
              `${flash_duration}s`
            );
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
        });
    } else {
      create_cell_status_actions(null);
    }

    console.log('jupyterlab_cell_status_extension:plugin activated...');
  }
};

export default plugin;
