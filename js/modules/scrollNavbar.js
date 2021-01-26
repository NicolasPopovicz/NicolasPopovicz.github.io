export default function initScrollNavbar() {
	const navbar = document.querySelector(".navbar"),
		internalLinks = document.querySelector(".internal-links");

	function scrollNavAnimation() {
		if (window.pageYOffset >= 500) {
			navbar.classList.add("navbar-scroll");
			internalLinks.classList.add("scroll");
		} else if (window.pageYOffset < 500) {
			navbar.classList.remove("navbar-scroll");
			navbar.style.transition = 0.5 + "s";
			internalLinks.style.transition = 0.5 + "s";
		}
	}

	window.onscroll = scrollNavAnimation;
}
