export default function initSmoothScroll() {
	function smoothScroll() {
		const internalLinks = document.querySelectorAll('a[href^="#"]');

		function scrollToSection(event) {
			event.preventDefault();
			const href = event.currentTarget.getAttribute("href");
			const section = document.querySelector(href);

			const top = section.offsetTop - 81;
			window.scrollTo({
				top: top,
				behavior: "smooth",
			});
		}
		internalLinks.forEach((link) => {
			link.addEventListener("click", scrollToSection);
		});
	}

	smoothScroll();
}
