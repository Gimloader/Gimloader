import Popup from "./Popup.svelte";
import { mount } from "svelte";
import styles from "./tailwind.css";
import Port from "$shared/net/port.svelte";

Port.init();

const style = document.createElement("style");
style.innerHTML = styles;
document.head.appendChild(style);

mount(Popup, {
    target: document.body
});
