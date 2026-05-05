window.onscroll = function() { stickyNavbar() };

const navbar = document.querySelector('.navbar');
const sticky = navbar.offsetTop;

function stickyNavbar() {
    if (window.pageYOffset > sticky) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
}

// Counter animation for stats
const stats = document.querySelectorAll('.stat');
stats.forEach(stat => {
    let count = 0;
    const target = +stat.innerText.replace(/[^0-9]/g, '');
    const speed = 200; // Lower is faster

    const updateCount = setInterval(() => {
        count += Math.ceil(target / speed);
        stat.innerText = count > target ? target : count;
        if (count >= target) clearInterval(updateCount);
    }, 1);
});