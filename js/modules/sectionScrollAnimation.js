export default function initSectionScrollAnimation() {
	const sections = document.querySelectorAll(".js-scroll");

	if (sections.length) {
		const windowHalf = window.innerHeight * 0.8;

		function animateScroll() {
			sections.forEach((section) => {
				const sectionTop = section.getBoundingClientRect().top;
				const isSectionVisible = sectionTop - windowHalf < 0;
				if (isSectionVisible) {
					section.classList.add("active");
				} else if (section.classList.contains("active")) {
					section.classList.remove("active");
				}
			});
		}

		animateScroll();

		window.addEventListener("scroll", animateScroll);
	}
}
