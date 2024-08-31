import '../app.css';
import Popup from './popup.svelte';

const target = document.getElementById('app') as HTMLElement;

async function render() {
    new Popup({ target });
}

document.addEventListener('DOMContentLoaded', render);