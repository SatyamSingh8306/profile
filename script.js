// Smooth Scrolling Effect for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Contact Form Submission
const form = document.getElementById("contact-form");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    alert("Thank you for reaching out! I'll get back to you soon.");
    form.reset();
});
