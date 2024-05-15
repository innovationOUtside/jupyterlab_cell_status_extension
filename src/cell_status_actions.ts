/********* JUPYTERLAB_CELL_STATUS_EXTENSION *********

The jupyertlab_cell_Status extension provides a range of 
cell display and cell accessibility features realting to
code cell execution:

- cell status indication: indicate cells that are queued for/pending execution,
  have completere cell execution successfully, or have a failed cell execution;
- cell flash (code via jupyterlab-cell-flash): flash the body of a code cell 
  when it successfull completes execution;
- audible alerts on successful or unsuccessful cell completion;
- spoken announcements describing cell exeucution errors.

*/

import { NotebookActions } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ICodeCellModel } from '@jupyterlab/cells';

import { play_success, play_error } from './cell_status_audio';
import { scc } from './utils';

// Act on updated user settings:
// - update cell status indicator colour CSS variables
// - update cell flash duration and colour CSS variables
// CSS variables and rules defiend in ../style/base.css
// Settings config and defaults defined in ../schema/plugin.json
export function update_cell_status_settings(
  settings: ISettingRegistry.ISettings,
  root: HTMLElement
) {
  // Get values from settings (settings config: ../schema/plugin.json)
  const queue_color = settings.get('cell_status_queue').composite as string;
  const success_color = settings.get('cell_status_success').composite as string;
  const error_color = settings.get('cell_status_error').composite as string;
  const flash_duration = settings.get('cell_flash_duration')
    .composite as number;
  // TO DO — Maybe consider different cell flash status colors?
  const flash_colour = settings.get('cell_flash_colour').composite as string;

  // Update CSS variables to use settings values
  // (CSS variables and style rules defined in ../style/base.css)
  root.style.setProperty('--jp-cell-status-queue', queue_color);
  root.style.setProperty('--jp-cell-status-success', success_color);
  root.style.setProperty('--jp-cell-status-error', error_color);
  root.style.setProperty('--jp-cell-flash-duration', `${flash_duration}s`);
  root.style.setProperty('--jp-cell-flash-color', flash_colour);
}

// Create actions on notebook cell execution related events
export const create_cell_status_actions = (
  settings: ISettingRegistry.ISettings | null
) => {
  //let heartbeatInterval = null;

  // The NotebookActions.executed event is fired
  // when a notebook cell completes execution.
  NotebookActions.executed.connect((_, args) => {
    const { cell } = args;
    // The code cell model gives us access to the code cell execution count number
    // If required, it also gives access to cell outputs.
    const codeCellModel = cell.model as ICodeCellModel;
    // Flag that identifies whether a cell executed successfully or not.
    const { success } = args;
    const { error } = args;

    // Hard code defaults if no settings are found.
    // (User settings config can be found in ../schema/plugin.json)
    // Should these be the same as the defaults in the settings file?
    let display_cell_status = true;
    let display_flash = false;
    let audio_success = false;
    let audio_error = false;
    let spoken_error = false;
    // Heartbeart is not yet available - need a "cell finished executing" signal
    //let use_heartbeat = false;
    //let heartbeat_pulse_s = 5;

    // If we have a settings file, get the settings from there
    // that relate to whether or not we want partiluar things to happen, such as:
    // - cell flash;
    // - audio alert on successful cell execution;
    // - audio alert on unsuccessful cell execution;
    // - spoken description of error message;
    if (settings != null) {
      // Get values from settings
      display_cell_status = settings.get('cell_status_enable').composite as boolean;
      display_flash = settings.get('cell_flash_enable').composite as boolean;
      audio_success = settings.get('cell_status_audio_success')
        .composite as boolean;
      audio_error = settings.get('cell_status_audio_error')
        .composite as boolean;
      spoken_error = settings.get('cell_status_error_spoken_alert')
        .composite as boolean;
      //use_heartbeat = settings.get('cell_status_heartbeat')
      //  .composite as boolean;
      //heartbeat_pulse_s = settings.get('cell_status_heartbeat_period')
      //  .composite as number;
    }

    // Cell flash - via https://github.com/jupyterlab-contrib/jupyterlab-cell-flash
    // Get a path to the cell's HTML element we want to flash
    const element = cell.editor?.host;
    if (element && display_flash) {
      // Give ourselves a clean cell flash context to work with
      element.classList.remove('cell-flash-effect');
      element.offsetWidth;
      // Define a callback function to tidy up a cell's HTML view
      // when the cell flash animation has finished playing
      const onAnimationEnd = (): void => {
        // animationcancel is a CSS animation event:
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event
        element.removeEventListener('animationcancel', onAnimationEnd);
        // animationend is a CSS animation event:
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
        element.removeEventListener('animationend', onAnimationEnd);
        element.classList.remove('cell-flash-effect');
      };
      // requestAnimationFrame is a browser window method
      // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      requestAnimationFrame(() => {
        element.addEventListener('animationend', onAnimationEnd);
        element.addEventListener('animationcancel', onAnimationEnd);
        element.classList.add('cell-flash-effect');
      });
    }

    // If we have a code cell, update the status
    if (display_cell_status && cell.model.type == 'code' && cell.inputArea) {
      cell.inputArea.promptNode.classList.remove('cell-status-scheduled');
      // If the cell execution was successful...
      if (success) {
        // Set the visual cell status indicator
        cell.inputArea.promptNode.classList.add('cell-status-success');
        // If required, generate the cell success audio tone
        if (audio_success) {
          play_success();
        }
      } else {
        // The cell execution failed for some reason.
        cell.inputArea.promptNode.classList.add('cell-status-error');
        // If we have either audible alert
        if (audio_error || spoken_error) {
          // If we have the spoken alert
          if (spoken_error) {
            // Generate the spoken alert message
            let line_error = '';
            const error_items =
              error?.traceback?.join('\n').trim().split('\n') || [];
            for (let line of error_items) {
              console.log('  - error item: ' + line + '<<\n');
            }
            const error_location = scc(error_items[0])
              .trim()
              .replace(/^Cell In\[\d+\],\s*/, '');
            const error_type = scc(error_items[error_items.length - 1]);

            let tracebackList = error?.traceback;
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
            // Maybe we should console log messages, perhaps tagged in a particular way
            // Then explore how the console log can be used to provide diagnostic and history info?

            const msg = `Error in executed cell ${codeCellModel.sharedModel.execution_count}. At ${line_error}. ${error_type}`;
            play_error(msg);
            console.log('Error errorName: ' + scc(error?.errorName) + '\n\n');
            console.log('Error Value' + scc(error?.errorValue) + '\n\n');
            console.log('Error Stack' + scc(error?.stack?.concat()) + '\n\n');
            console.log('Error message' + scc(error?.message) + '\n\n');
            console.log('Error name' + scc(error?.name) + '\n\n');
            console.log(
              'Error traceback' + scc(error?.traceback?.join('\n')) + '\n\n'
            );
            console.log('Line error ' + line_error + '\n\n');
            console.log(`AA ${error_location} BB ${error_type} CC`);
          } // If required, just use the simple audio tone alert
          else if (audio_error) play_error();
        }
      }
    }
  });

  // The NotebookActions.executionScheduled event fires
  // when a cell is scheduled for execution.
  NotebookActions.executionScheduled.connect((_, args) => {
    const { cell } = args;
    let display_cell_status = true;
    if (settings != null) {
      display_cell_status = settings.get('cell_status_enable').composite as boolean;
    }
    // If we have a code cell, set up the cell flash mechanism:
    // - set the status class to "scheduled"
    // - remove the other cell flash classes
    // ?? Is there a way of detecting that a cell is running rather than scheduled?
    if (display_cell_status && cell.model.type == 'code' && cell.inputArea) {
      cell.inputArea.promptNode.classList.remove('cell-status-success');
      cell.inputArea.promptNode.classList.remove('cell-status-error');
      cell.inputArea.promptNode.classList.add('cell-status-scheduled');
    } else if (!display_cell_status && cell.model.type == 'code' && cell.inputArea) {
      // TO DO — this feels slightly overkill but it helps clear unwanted CSS state
      // If we can trigger an update on a settings change,
      // would it be better to set CSS to transparent if there is no display?
      cell.inputArea.promptNode.classList.remove('cell-status-scheduled');
      cell.inputArea.promptNode.classList.remove('cell-status-success');
      cell.inputArea.promptNode.classList.remove('cell-status-error');
    }
  });
};
