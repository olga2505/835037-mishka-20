var navHeader = document.querySelector(".page-header__wrap");
var menuToggle = document.querySelector(".menu-toggle");

navHeader.classList.remove("page-header--nojs");
navHeader.classList.remove("page-header__wrap--open-menu");
navHeader.classList.add("page-header__wrap--clossed-menu");

menuToggle.addEventListener("click", function () {
    navHeader.classList.toggle("page-header__wrap--clossed-menu");
    navHeader.classList.toggle("page-header__wrap--open-menu");
})
