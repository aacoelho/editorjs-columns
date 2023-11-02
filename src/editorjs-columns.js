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


	constructor({ data, config, api, readOnly }) {
		// console.log("API")
		// console.log(api)
		// start by setting up the required parts
		this.api = api;
		this.readOnly = readOnly;
		this.config = config || {}

		console.log(this.config)

		console.log(this.config.EditorJsLibrary)

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
		console.log(e)
		console.log("heyup")
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
				icon : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 641 640"><path d="M65 174h232.727v292H65V174Zm279.273 0H577v292H344.273V174Z" fill="#5C6B7A" fill-rule="nonzero"/></svg>`,
				label : "2-column layout",
				onActivate : () => {this._updateCols(2)}
			},
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 641 640"><path d="M30 175h162.96v292H30V175Zm209.52 0h162.96v292H239.52V175Zm209.52 0H612v292H449.04V175Z" fill="#5C6B7A" fill-rule="nonzero"/></svg>`,
				label : "3-column layout",
				onActivate : () => {this._updateCols(3)}
			},
			{
				icon : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M319.5 87.273V0L203.25 116.364 319.5 232.727v-87.272c96.342 0 174.375 78.109 174.375 174.545 0 29.527-7.41 57.164-20.198 81.6l42.43 42.473C538.632 408 552 365.673 552 320c0-128.582-104.044-232.727-232.5-232.727Zm0 407.272c-96.342 0-174.375-78.109-174.375-174.545 0-29.527 7.41-57.164 20.198-81.6l-42.43-42.473C100.368 232 87 274.327 87 320c0 128.582 104.044 232.727 232.5 232.727V640l116.25-116.364L319.5 407.273v87.272Z" fill="#5C6B7A" fill-rule="nonzero"/></svg>`,
				label : "Rearrange columns",
				onActivate : () => {this._rearrangeCols()}
			},
			]
	}


	_rearrangeCols() {
		// this shifts or "rolls" the columns
		this.data.cols.unshift(this.data.cols.pop());
		this.editors.cols.unshift(this.editors.cols.pop());
		this._rerender();
	}

	async _updateCols(num) {
		// Should probably update to make number dynamic... but this will do for now
		if (num == 2) {
			if (this.editors.numberOfColumns == 3) {
				let resp = await Swal.fire({
					title: "Are you sure?",
					text: "This will delete Column 3!",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#3085d6",
					cancelButtonColor: "#d33",
					confirmButtonText: "Yes, delete it!",
				});

				if (resp.isConfirmed) {
					this.editors.numberOfColumns = 2;
					this.data.cols.pop();
					this.editors.cols.pop();
					this._rerender();
				}
			}
		}
		if (num == 3) {
			this.editors.numberOfColumns = 3;
			this._rerender();
			// console.log(3);
		}
	}

	async _rerender() {
		await this.save();
		// console.log(this.colWrapper);

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}
		this.editors.cols = [];

		this.colWrapper.innerHTML = "";

		// console.log("Building the columns");

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			// console.log("Start column, ", index);
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();
			// console.log("generating: ", editor_col_id);
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			this.editors.cols.push(editorjs_instance);
		}
	}

	render() {

		// This is needed to prevent the enter / tab keys - it globally removes them!!!


		// // it runs MULTIPLE times. - this is not good, but works for now






		// console.log("Generating Wrapper");

		// console.log(this.api.blocks.getCurrentBlockIndex());

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");



		// astops the double paste issue
		this.colWrapper.addEventListener('paste', (event) => {
			// event.preventDefault();
			event.stopPropagation();
		}, true);   



		this.colWrapper.addEventListener('keydown', (event) => {

			// if (event.key === "Enter" && event.altKey) {
			// 	console.log("ENTER ALT Captured")
			// 	console.log(event.target)

			// 	// let b = event.target.dispatchEvent(new KeyboardEvent('keyup',{'key':'a'}));

			// 	event.target.innerText += "Aß"

			// 	// console.log(b)
			// }
			// else 
			if (event.key === "Enter") {
				// Applies behaviour of current block
				// event.preventDefault(); 
				event.stopImmediatePropagation();
				event.stopPropagation();
				
				// console.log("ENTER Captured")
				// this.api.blocks.insertNewBlock({type : "alert"});
				// console.log("Added Block")
			}
			if (event.key === "Tab") {
				// event.stopImmediatePropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				
				// console.log("TAB Captured")
			}
		});





		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}

		// console.log(this.editors.cols);
		this.editors.cols = []; //empty the array of editors
		// console.log(this.editors.cols);

		// console.log("Building the columns");

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			// console.log("Start column, ", index);
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();
			// console.log("generating: ", editor_col_id);
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			this.editors.cols.push(editorjs_instance);
			// console.log("End column, ", index);
		}
		return this.colWrapper;
	}

	async save() {
		if(!this.readOnly){
			// console.log("Saving");
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
