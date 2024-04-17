import { NotebookActions } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { play_success, play_error } from './cell_status_audio';
import { scc } from './utils';
import { ICodeCellModel } from '@jupyterlab/cells';

export const create_cell_status_actions = (
  settings: ISettingRegistry.ISettings | null
) => {
  //let heartbeatInterval = null;
  NotebookActions.executed.connect((_, args) => {
    const { cell } = args;
    const codeCellModel = cell.model as ICodeCellModel;
    const { success } = args;
    let display_flash = false;
    let audio_success = false;
    let audio_error = false;
    let spoken_error_cellnum = false;
    //let use_heartbeat = false;
    //let heartbeat_pulse_s = 5;
    if (settings != null) {
      display_flash = settings.get('flash_enable').composite as boolean;
      audio_success = settings.get('cell_status_audio_success')
        .composite as boolean;
      audio_error = settings.get('cell_status_audio_error')
        .composite as boolean;
      spoken_error_cellnum = settings.get('cell_status_error_spoken_alert')
        .composite as boolean;
    }
    //Cell flash - via https://github.com/jupyterlab-contrib/jupyterlab-cell-flash
    const element = cell.editor?.host;
    if (element && display_flash) {
      element.classList.remove('flash-effect');
      element.offsetWidth;
      const onAnimationEnd = (): void => {
        element.removeEventListener('animationcancel', onAnimationEnd);
        element.removeEventListener('animationend', onAnimationEnd);
        element.classList.remove('flash-effect');
      };
      requestAnimationFrame(() => {
        element.addEventListener('animationend', onAnimationEnd);
        element.addEventListener('animationcancel', onAnimationEnd);
        element.classList.add('flash-effect');
      });
    }

    // If we have a code cell, update the status
    if (cell.model.type == 'code' && cell.inputArea) {
      cell.inputArea.promptNode.classList.remove('scheduled');
      if (success) {
        cell.inputArea.promptNode.classList.add('executed-success');
        if (audio_success) {
          play_success();
        }
      } else {
        cell.inputArea.promptNode.classList.add('executed-error');
        if (audio_error) {
          if (spoken_error_cellnum) {
            let line_error = '';
            const error_items =
              args.error?.traceback?.join('\n').trim().split('\n') || [];
            for (let line of error_items) {
              console.log('  - error item: ' + line + '<<\n');
            }
            const error_location = scc(error_items[0])
              .trim()
              .replace(/^Cell In\[\d+\],\s*/, '');
            const error_type = scc(error_items[error_items.length - 1]);

            let tracebackList = args.error?.traceback;
            if (tracebackList) {
              for (let line of tracebackList) {
                if (scc(line).trim().startsWith('Cell In')) {
                  line_error = scc(line)
                    .trim()
                    .replace(/^Cell In\[\d+\],\s*/, '')
                    .split('\n')[0];
                  break;
                }
              }
            }

            const msg = `Error in cell ${codeCellModel.sharedModel.execution_count}. At ${line_error}. ${error_type}`;
            play_error(msg);
            console.log(
              'Error errorName: ' + scc(args.error?.errorName) + '\n\n'
            );
            console.log('Error Value' + scc(args.error?.errorValue) + '\n\n');
            console.log(
              'Error Stack' + scc(args.error?.stack?.concat()) + '\n\n'
            );
            console.log('Error message' + scc(args.error?.message) + '\n\n');
            console.log('Error name' + scc(args.error?.name) + '\n\n');
            console.log(
              'Error traceback' +
                scc(args.error?.traceback?.join('\n')) +
                '\n\n'
            );
            console.log('Line error ' + line_error + '\n\n');
            console.log(`AA ${error_location} BB ${error_type} CC`);
          } else play_error();
        }
      }
    }
  });

  NotebookActions.executionScheduled.connect((_, args) => {
    const { cell } = args;
    // If we have a code cell
    // set the status class to "scheduled"
    // and remove the other classes
    // ?? Is there a way of detecting that a cell is running rather than scheduled?
    if (cell.model.type == 'code' && cell.inputArea) {
      cell.inputArea.promptNode.classList.remove('executed-success');
      cell.inputArea.promptNode.classList.remove('executed-error');
      cell.inputArea.promptNode.classList.add('scheduled');
    }
  });
};
