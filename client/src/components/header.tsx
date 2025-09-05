import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "header-blur" : ""
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PS</span>
          </div>
          <span className="text-xl font-bold tracking-wider">PANICKIN' SKYWALKER</span>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-widest">
          <li>
            <button
              onClick={() => scrollToSection("home")}
              className="hover:text-primary transition-colors"
              data-testid="nav-home"
            >
              HOME
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("music")}
              className="hover:text-primary transition-colors"
              data-testid="nav-music"
            >
              MUSIC
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("band")}
              className="hover:text-primary transition-colors"
              data-testid="nav-band"
            >
              BAND
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("tour")}
              className="hover:text-primary transition-colors"
              data-testid="nav-tour"
            >
              TOUR
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-primary transition-colors"
              data-testid="nav-contact"
            >
              CONTACT
            </button>
          </li>
        </ul>

        {/* Social Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-spotify"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-apple"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-youtube"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.196 5.036.369a3.426 3.426 0 0 0-1.238.808 3.426 3.426 0 0 0-.808 1.238C2.817 2.899 2.703 3.473 2.669 4.42 2.634 5.368 2.621 5.775 2.621 9.396c0 3.621.013 4.028.048 4.976.034.947.148 1.521.321 2.005a3.426 3.426 0 0 0 .808 1.238 3.426 3.426 0 0 0 1.238.808c.484.173 1.058.287 2.005.321.948.035 1.355.048 4.976.048 3.621 0 4.028-.013 4.976-.048.947-.034 1.521-.148 2.005-.321a3.426 3.426 0 0 0 1.238-.808 3.426 3.426 0 0 0 .808-1.238c.173-.484.287-1.058.321-2.005.035-.948.048-1.355.048-4.976 0-3.621-.013-4.028-.048-4.976-.034-.947-.148-1.521-.321-2.005a3.426 3.426 0 0 0-.808-1.238A3.426 3.426 0 0 0 19.005.369C18.521.196 17.947.082 17 .048 16.052.013 15.645 0 12.017 0zm-.024 1.872c3.536 0 3.954.011 5.35.046.944.034 1.458.156 1.798.26.452.176.775.387 1.114.726.339.339.55.662.726 1.114.104.34.226.854.26 1.798.035 1.396.046 1.814.046 5.35 0 3.536-.011 3.954-.046 5.35-.034.944-.156 1.458-.26 1.798a2.975 2.975 0 0 1-.726 1.114 2.975 2.975 0 0 1-1.114.726c-.34.104-.854.226-1.798.26-1.396.035-1.814.046-5.35.046-3.536 0-3.954-.011-5.35-.046-.944-.034-1.458-.156-1.798-.26a2.975 2.975 0 0 1-1.114-.726 2.975 2.975 0 0 1-.726-1.114c-.104-.34-.226-.854-.26-1.798-.035-1.396-.046-1.814-.046-5.35 0-3.536.011-3.954.046-5.35.034-.944.156-1.458.26-1.798.176-.452.387-.775.726-1.114.339-.339.662-.55 1.114-.726.34-.104.854-.226 1.798-.26 1.396-.035 1.814-.046 5.35-.046z"/>
              <path d="M12.017 7.054a4.942 4.942 0 1 0 0 9.883 4.942 4.942 0 0 0 0-9.883zm0 8.148a3.207 3.207 0 1 1 0-6.414 3.207 3.207 0 0 1 0 6.414z"/>
              <circle cx="16.948" cy="7.044" r="1.157"/>
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-tiktok"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="social-discord"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="mobile-menu-button"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-6">
              <ul className="space-y-4 text-center font-semibold tracking-widest">
                <li>
                  <button
                    onClick={() => scrollToSection("home")}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-home"
                  >
                    HOME
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("music")}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-music"
                  >
                    MUSIC
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("band")}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-band"
                  >
                    BAND
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("tour")}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-tour"
                  >
                    TOUR
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="block hover:text-primary transition-colors"
                    data-testid="mobile-nav-contact"
                  >
                    CONTACT
                  </button>
                </li>
              </ul>
              <div className="flex justify-center items-center space-x-6 mt-6">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-spotify"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-apple"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-youtube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.082 5.52.196 5.036.369a3.426 3.426 0 0 0-1.238.808 3.426 3.426 0 0 0-.808 1.238C2.817 2.899 2.703 3.473 2.669 4.42 2.634 5.368 2.621 5.775 2.621 9.396c0 3.621.013 4.028.048 4.976.034.947.148 1.521.321 2.005a3.426 3.426 0 0 0 .808 1.238 3.426 3.426 0 0 0 1.238.808c.484.173 1.058.287 2.005.321.948.035 1.355.048 4.976.048 3.621 0 4.028-.013 4.976-.048.947-.034 1.521-.148 2.005-.321a3.426 3.426 0 0 0 1.238-.808 3.426 3.426 0 0 0 .808-1.238c.173-.484.287-1.058.321-2.005.035-.948.048-1.355.048-4.976 0-3.621-.013-4.028-.048-4.976-.034-.947-.148-1.521-.321-2.005a3.426 3.426 0 0 0-.808-1.238A3.426 3.426 0 0 0 19.005.369C18.521.196 17.947.082 17 .048 16.052.013 15.645 0 12.017 0zm-.024 1.872c3.536 0 3.954.011 5.35.046.944.034 1.458.156 1.798.26.452.176.775.387 1.114.726.339.339.55.662.726 1.114.104.34.226.854.26 1.798.035 1.396.046 1.814.046 5.35 0 3.536-.011 3.954-.046 5.35-.034.944-.156 1.458-.26 1.798a2.975 2.975 0 0 1-.726 1.114 2.975 2.975 0 0 1-1.114.726c-.34.104-.854.226-1.798.26-1.396.035-1.814.046-5.35.046-3.536 0-3.954-.011-5.35-.046-.944-.034-1.458-.156-1.798-.26a2.975 2.975 0 0 1-1.114-.726 2.975 2.975 0 0 1-.726-1.114c-.104-.34-.226-.854-.26-1.798-.035-1.396-.046-1.814-.046-5.35 0-3.536.011-3.954.046-5.35.034-.944.156-1.458.26-1.798.176-.452.387-.775.726-1.114.339-.339.662-.55 1.114-.726.34-.104.854-.226 1.798-.26 1.396-.035 1.814-.046 5.35-.046z"/>
                    <path d="M12.017 7.054a4.942 4.942 0 1 0 0 9.883 4.942 4.942 0 0 0 0-9.883zm0 8.148a3.207 3.207 0 1 1 0-6.414 3.207 3.207 0 0 1 0 6.414z"/>
                    <circle cx="16.948" cy="7.044" r="1.157"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-tiktok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="mobile-social-discord"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
