export default function initAge() {
    let year = (new Date()).getFullYear();

    document.querySelector("#age").innerText = year - 2001;
}