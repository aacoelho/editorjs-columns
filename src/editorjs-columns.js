/**
 * Column Block for the Editor.js.
 *
 * @author Calum Knott (calum@calumk.com)
 * @copyright Calum Knott
 * @license The MIT License (MIT)
 */

/**
 * @typedef {Object} EditorJsColumnsData
 * @description Tool's input and output data format
 */

import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

import icon from "./editorjs-columns.svg";
import style from "./editorjs-columns.scss";

// import EditorJS from '@editorjs/editorjs'; // required for npm mode

class EditorJsColumns {

	static get enableLineBreaks() {
		return true;
	}


	constructor({ data, block, config, api, readOnly }) {
		// start by setting up the required parts
		this.api = api;

		this.readOnly = readOnly;
		this.config = config || {}

		// console.log(this.config)

		// console.log(this.config.EditorJsLibrary)

		this._CSS = {
			block: this.api.styles.block,
			wrapper: "ce-EditorJsColumns",
		};

		if (!this.readOnly) {
			this.onKeyUp = this.onKeyUp.bind(this);
		}
		
		this._data = {};

		this.editors = {};

		this.colWrapper = undefined;

		this.editors.cols = [];

		this.data = data;

    this.block = block;

		if (!Array.isArray(this.data.cols)) {
			this.data.cols = [];
			this.editors.numberOfColumns = 2;
		} else {
			this.editors.numberOfColumns = this.data.cols.length;
		}

	}

	static get isReadOnlySupported() {
		return true;
	}


	onKeyUp(e) {
		// console.log(e)
		// console.log("heyup")
		if (e.code !== "Backspace" && e.code !== "Delete") {
			return;
		}
	}

	get CSS() {
		return {
			settingsButton: this.api.styles.settingsButton,
			settingsButtonActive: this.api.styles.settingsButtonActive,
		};
	}


	renderSettings() {
		return [
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM152,168a8,8,0,0,1,0,16H104a8,8,0,0,1-6.4-12.8l43.17-57.56a16,16,0,1,0-27.86-15,8,8,0,0,1-15.09-5.34,32,32,0,1,1,55.74,29.93L120,168Z"></path></svg>`,
				label : this.api.i18n.t("2 Columns"),
				onActivate : () => {this._updateCols(2)}
			},
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM124,184a35.71,35.71,0,0,1-25.71-10.81A8,8,0,1,1,109.71,162,20,20,0,1,0,124,128a8,8,0,0,1-6.55-12.59L136.63,88H104a8,8,0,0,1,0-16h48a8,8,0,0,1,6.55,12.59l-21,30A36,36,0,0,1,124,184Z"></path></svg>`,
				label : this.api.i18n.t("3 Columns"),
				onActivate : () => {this._updateCols(3)}
			},
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM160,160h-8v16a8,8,0,0,1-16,0V160H88a8,8,0,0,1-6.31-12.91l56-72A8,8,0,0,1,152,80v64h8a8,8,0,0,1,0,16Zm-55.64-16L136,103.32V144Z"></path></svg>`,
				label : this.api.i18n.t("4 Columns"),
				onActivate : () => {this._updateCols(4)}
			},
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,13.66-5.66L64,60.7a95.42,95.42,0,0,1,66-26.76h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.48,79.48,0,0,0,75.35,72L93.66,90.34A8,8,0,0,1,88,104Zm128,48H168a8,8,0,0,0-5.66,13.66L180.65,184a79.48,79.48,0,0,1-54.72,22.09h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.42,95.42,0,0,0,66-26.76l18.36,18.36A8,8,0,0,0,224,208V160A8,8,0,0,0,216,152Z"></path></svg>`,
				label : this.api.i18n.t("Roll Columns"),
				onActivate : () => {this._rollColumns()}
			},
			]
	}


	_rollColumns() {
		// this shifts or "rolls" the columns
		this.data.cols.unshift(this.data.cols.pop());
		this.editors.cols.unshift(this.editors.cols.pop());
		this._rerender();
	}

	async _updateCols(num) {
		const newNumberOfColumns = num;
		const currentNumberOfColumns = this.editors.numberOfColumns;
		
		if (newNumberOfColumns < currentNumberOfColumns) {
			const columnsToDelete = currentNumberOfColumns - newNumberOfColumns;
			let resp = await Swal.fire({
				title: this.api.i18n.t("Are you sure?"),
				text: this.api.i18n.t(`This will delete the last ${columnsToDelete ==="1" ? "column" : `${columnsToDelete} columns`}!`),
				icon: "warning",
				showCancelButton: true,
				cancelButtonText: this.api.i18n.t("Cancel"),
				confirmButtonColor: "#3085d6",
				cancelButtonColor: "#d33",
				confirmButtonText: this.api.i18n.t("Yes, delete it!"),
			});

			if (resp.isConfirmed) {
				this.editors.numberOfColumns = newNumberOfColumns;
				for (let index = 0; index < columnsToDelete; index++) {
					this.data.cols.pop();
					this.editors.cols.pop();
				}
				this._rerender();
			}
		}
		else if (newNumberOfColumns > currentNumberOfColumns) {
			this.editors.numberOfColumns = newNumberOfColumns;
			this._rerender();
		}
	}

	async _rerender() {
		await this.save();

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}
		this.editors.cols = [];

		this.colWrapper.innerHTML = "";


		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();

			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
        onChange: function(api, event) {
          let selection = document.getSelection();
          if(selection != undefined && selection.anchorNode != undefined) {
            if(selection.anchorNode.closest != undefined) {
              let column = selection.anchorNode.closest('.ce-editorjsColumns_col');
              window.active_column_index = column.classList[1].slice(-1);
            }
          }
        }
			});

			this.editors.cols.push(editorjs_instance);
		}
	}

	render() {

		// This is needed to prevent the enter / tab keys - it globally removes them!!!
		// // it runs MULTIPLE times. - this is not good, but works for now

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");

		// astops the double paste issue
		// this.colWrapper.addEventListener('paste', (event) => {
		// 	// event.preventDefault();
		// 	event.stopPropagation();
		// }, true);   

		this.colWrapper.addEventListener('keydown', (event) => {
			if (event.key === "Enter") {
				// Applies behaviour of current block
				// event.preventDefault(); 
				event.stopImmediatePropagation();
				event.stopPropagation();
			}
			if (event.key === "Tab") {
				// event.stopImmediatePropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
			}
		});



		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}

		this.editors.cols = []; //empty the array of editors

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
        onChange: function(api, event) {
          let selection = document.getSelection();
          if(selection != undefined && selection.anchorNode != undefined) {
            if(selection.anchorNode.closest != undefined) {
              let column = selection.anchorNode.closest('.ce-editorjsColumns_col');
              window.active_column_index = column.classList[1].slice(-1);
            }
          }
        }
			});

			this.editors.cols.push(editorjs_instance);
		}
		return this.colWrapper;
	}

	async save() {
		if(!this.readOnly){
      if(this.block.id == window.current_block_id) {
        window.editors = this.editors;
      }

			for (let index = 0; index < this.editors.cols.length; index++) {
				let colData = await this.editors.cols[index].save();
				this.data.cols[index] = colData;
			}
		}
		return this.data;
	}

	static get toolbox() {
		return {
			icon: icon,
			title: "Columns",
		};
	}
}

export { EditorJsColumns as default };
