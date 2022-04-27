"use strict";
(self["webpackChunkjupyterlab_cell_status_extension"] = self["webpackChunkjupyterlab_cell_status_extension"] || []).push([["lib_index_js"],{

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/settingregistry */ "webpack/sharing/consume/default/@jupyterlab/settingregistry");
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_1__);
//https://jupyterlab.readthedocs.io/en/3.1.x/api/classes/notebook.notebookactions-1.html

//import { IKernelConnection } from '@jupyterlab/services/Kernel IKernelConnection';

/**
 * Initialization data for the jupyterlab-cell-flash extension.
 */
const plugin = {
    activate,
    id: 'jupyterlab_cell_status:plugin',
    autoStart: true,
    optional: [_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_1__.ISettingRegistry],
};
function activate(app, settingRegistry) {
    console.log("jupyterlab_cell_status:plugin activating...");
    if (settingRegistry) {
        settingRegistry
            .load(plugin.id)
            .then(settings => {
            const root = document.documentElement;
            const updateSettings = () => {
                const queue_color = settings.get('status_queue').composite;
                const success_color = settings.get('status_success').composite;
                const error_color = settings.get('status_error').composite;
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
    _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__.NotebookActions.executed.connect((_, args) => {
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
    _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__.NotebookActions.executionScheduled.connect((_, args) => {
        const { cell } = args;
        if (cell.model.type == 'code') {
            cell.inputArea.promptNode.classList.remove("executed");
            cell.inputArea.promptNode.classList.add("scheduled");
        }
    });
    // If the kernel is stopped, we need to clear all the status indications
    // https://jupyterlab.readthedocs.io/en/3.1.x/api/modules/services.kernel.html#connectionstatus
    // Status based on IKernelConnection
    // Clear classes on the following Status values?
    //"starting"  "terminating" | "restarting" | "autorestarting" | "dead"
    // or maybe just starting and restarting?
    // Cell status should reflect likely state...
    // We could add a button to clear status settings
    console.log("jupyterlab_cell_status:plugin activated...");
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.bdc9b9eb591a695fdc61.js.map