"use strict";

const projects = [
  { title: "ISITI Asset Inventory System", category: "Asset inventory", year: "Job on Campus (JoC)", role: "Inventory system development", tools: "Add the languages and tools used", description: "Built an inventory system for filing and tracking assets at the Institute of Social Informatics and Technological Innovations (ISITI), a research institute at UNIMAS. Completed under the Job on Campus (JoC) programme, with support on other internal projects." },
  { title: "Kuching Water Board Billing Prototype", category: "Billing system prototype", year: "Prototype project", role: "C program prototype", tools: "C", description: "Created a C program prototype for calculating water charges based on consumption and industry type." },
  { title: "Gym Membership Database", category: "Membership database", year: "Database project", role: "Database project", tools: "Database system", description: "A database project for managing member records, class enrollments and schedules, payment details, and membership expiry dates." },
  { title: "Interactive Quiz Application", category: "Java Swing quiz app", year: "Java project", role: "Java application development", tools: "Java, Java Swing", description: "A desktop quiz with a structured Java Swing GUI and clear app-like workflow. It includes 20 multiple-choice and true/false questions, next-question navigation, score tracking, progress display, a result screen, and score-based motivational messages." },
  { title: "Personal Portfolio Website", category: "Personal portfolio website", year: "In progress", role: "Web development", tools: "HTML, CSS, JavaScript", description: "An in-progress portfolio built with HTML, CSS, and JavaScript to present my background, projects, skills, and contact details." }
];

const body = document.body;
const themeButton = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const cards = [...document.querySelectorAll(".project-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const searchInput = document.querySelector("#project-search");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#project-dialog");
const toast = document.querySelector("#toast");
let activeFilter = "all";
let toastTimer;

// 1. Restore the visitor's chosen color theme and save later changes.
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") body.classList.add("theme-dark");
themeButton.addEventListener("click", () => {
  const isDark = body.classList.toggle("theme-dark");
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  showToast(isDark ? "Dark theme on" : "Light theme on");
});

// 2-3. Expand the compact mobile menu and close it after choosing a section.
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  nav.classList.toggle("is-open", !isOpen);
});
navLinks.forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  nav.classList.remove("is-open");
}));

// 4. Keep the navigation indicator in sync with the section in view.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

// 5-6. Combine category filters with a case-insensitive project search.
function updateProjects() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;
  cards.forEach((card, index) => {
    const project = projects[index];
    const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
    const textMatches = `${project.title} ${project.category} ${project.description}`.toLocaleLowerCase().includes(query);
    const visible = categoryMatches && textMatches;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  emptyState.hidden = visibleCount > 0;
}
filterButtons.forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach((item) => {
    const selected = item === button;
    item.classList.toggle("is-selected", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  updateProjects();
}));
searchInput.addEventListener("input", updateProjects);

// 7. Show each project's expanded details in a native, keyboard-friendly dialog.
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogRole = document.querySelector("#dialog-role");
const dialogTools = document.querySelector("#dialog-tools");
const dialogYear = document.querySelector("#dialog-year");
function openProject(index) {
  const project = projects[index];
  if (!project) return;
  document.querySelector("#dialog-kicker").textContent = `${project.category.toUpperCase()} / 0${index + 1}`;
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  dialogRole.textContent = project.role;
  dialogTools.textContent = project.tools;
  dialogYear.textContent = project.year;
  dialog.showModal();
}
document.querySelectorAll("[data-project]").forEach((button) => button.addEventListener("click", () => openProject(Number(button.dataset.project))));
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

// 8. Copy the email address with a clear fallback and status message.
const copyButton = document.querySelector("[data-copy-email]");
copyButton.addEventListener("click", async () => {
  const email = copyButton.dataset.copyEmail;
  try {
    await navigator.clipboard.writeText(email);
    document.querySelector(".copy-status").textContent = "Email copied to clipboard.";
    showToast("Email copied");
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = email;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    body.append(temporary);
    temporary.select();
    const copied = document.execCommand("copy");
    temporary.remove();
    document.querySelector(".copy-status").textContent = copied ? "Email copied to clipboard." : `Email: ${email}`;
    showToast(copied ? "Email copied" : `Email: ${email}`);
  }
});

// 9. Reveal content as it enters view, while respecting reduced-motion preferences.
const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// 10. Keep the footer year current without a manual annual edit.
document.querySelector("#year").textContent = new Date().getFullYear();

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
