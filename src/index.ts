
   
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

//https://jupyterlab.readthedocs.io/en/3.1.x/api/classes/notebook.notebookactions-1.html
import { NotebookActions } from '@jupyterlab/notebook';
//import { IKernelConnection } from '@jupyterlab/services/Kernel IKernelConnection';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

/**
 * Initialization data for the jupyterlab-cell-flash extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'jupyterlab_cell_status:plugin',
  autoStart: true,
  optional: [ISettingRegistry],//, IKernelConnection]
};

function activate (
  app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null): void {
    console.log("jupyterlab_cell_status:plugin activating...");
    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          const root = document.documentElement;
          const updateSettings = (): void => {
            const queue_color = settings.get('status_queue').composite as string;
            const success_color = settings.get('status_success').composite as string;
            const error_color = settings.get('status_error').composite as string;
            root.style.setProperty('--jp-cell-status-queue', queue_color);
            root.style.setProperty('--jp-cell-status-success', success_color);
            root.style.setProperty('--jp-cell-status-error', error_color);
          };
          updateSettings();
          // We can auto update the color
          settings.changed.connect(updateSettings);
        })
        .catch(reason => {
          console.error('Failed to load settings for jupyterlab_cell_status_extension.', reason);
      });
    }

    /*
    IKernelConnection.connectionStatusChanged.connect((kernel, conn_stat) => {

    console.log("KERNEL ****"+conn_stat)
    });
    */
    NotebookActions.executed.connect((_, args) => {
      const { cell } = args;
      const { success } = args;
      if (cell.model.type == 'code') {
        if (success)
          cell.inputArea.promptNode.classList.add("executed-success");
        else
          cell.inputArea.promptNode.classList.add("executed-error");
          cell.inputArea.promptNode.classList.remove("scheduled");
      }
    });

    NotebookActions.executionScheduled.connect((_, args) => {
      const { cell } = args;
      if (cell.model.type == 'code') {
        cell.inputArea.promptNode.classList.remove("executed");
        cell.inputArea.promptNode.classList.add("scheduled");
      }
    });  

    console.log("jupyterlab_cell_status:plugin activated...");
  }

export default plugin;