import '../app.css'
import Options from "../components/Options.svelte";

const target = document.getElementById('app') as HTMLElement;

async function render() {
    new Options({ target });
}

document.addEventListener('DOMContentLoaded', render)