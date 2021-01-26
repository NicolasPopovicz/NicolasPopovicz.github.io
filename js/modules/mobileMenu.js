export default function initMobileMenu() {
	const button = document.querySelector(".mobile-menu"),
		menu = document.querySelector(".internal-links"),
		link = document.querySelectorAll(".js-menu a[href^='#']");

	function showMenu() {
		if (!menu.classList.contains("active")) {
			menu.classList.add("active");
			menu.classList.add("scroll");
			button.style.transform = "rotate(-90deg)";
		} else if (menu.classList.contains("active")) {
			menu.classList.remove("active");
			menu.classList.remove("scroll");
			button.style.transform = "rotate(0deg)";
		}
	}

	function removeClass() {
		if (menu.classList.contains("active")) {
			menu.classList.remove("active");
			button.style.transform = "rotate(0deg)";
		}
	}

	button.addEventListener("click", showMenu);
	link.forEach((links) => {
		links.addEventListener("click", removeClass);
	});
}
