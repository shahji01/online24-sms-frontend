// src/lib/select2Loader.js
import $ from "jquery";

// force attach to window
window.$ = $;
window.jQuery = $;

// manually import select2 and bind
import select2 from 'select2/dist/js/select2.full.js';
import 'select2/dist/css/select2.min.css';

// ✅ manually bind to jQuery prototype
$.fn.select2 = select2;

export default $;
