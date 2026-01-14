"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [error, setError] = useState("");
  const [adminPassword, setAdminPassword] = useState("1234");
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [content, setContent] = useState({
    brandFirst: "RABIA",
    brandSecond: "HAQ QURESHI",
    heroHeading: "WE ARE\nHIRING",
    heroSubheading: "COMPUTER OPERATOR CUM TELECALLER ( FEMALE )",
    feature1: "Proficiency in Computer Knowledge",
    feature2: "Person residing with 10 km Radius of kannur town Need only apply",
    feature3: "Minimum 2 years Experience",
    feature4: "Good Communication skills",
    certTitle: "OUR CERTIFICATES",
    expTitle: "OUR EXPERIENCE",
    footerDesc: "Providing top-tier digital solutions and professional support services with a decade of excellence in the industry.",
    footerAddress: "Kannur Town, Kerala, India - 670001",
    footerPhone: "+91 98765 43210",
    footerEmail: "info@rabiahaqqur.com",
    footerCopyright: "© 2026 RABIA HAQQUR. All rights reserved.",
    cvUrl: "#",
    heroImage: "/support_agent.png"
  });

  const [socials, setSocials] = useState([
    { name: 'facebook', url: 'https://facebook.com', hidden: false, path: 'M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z' },
    { name: 'twitter', url: 'https://twitter.com', hidden: false, path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'linkedin', url: 'https://linkedin.com', hidden: false, path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { name: 'instagram', url: 'https://instagram.com', hidden: false, path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.031.935 20.36.53 19.57.245 18.805.148 17.935.072 16.632.072 15.333.015 14.925 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  ]);

  const [certificates, setCertificates] = useState([
    { id: 1, title: "Excellence in Service", image: "/support_agent.png" },
    { id: 2, title: "Achievement Award 2024", image: "/support_agent.png" },
    { id: 3, title: "Quality Assurance", image: "/support_agent.png" },
    { id: 4, title: "Top Performance", image: "/support_agent.png" },
    { id: 5, title: "Customer Satisfaction", image: "/support_agent.png" },
  ]);

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Senior Computer Operator",
      date: "2020 - Present",
      description: "Leading the digital transformation and data management team with high precision and efficiency. Implementing advanced workflows that increased productivity by 40%.",
      color: "#28A745"
    },
    {
      id: 2,
      title: "Team Leader - Telecalling",
      date: "2018 - 2020",
      description: "Managed a team of 15+ professionals, ensuring top-tier communication and customer satisfaction benchmarks were consistently exceeded.",
      color: "#2D2D7B"
    },
    {
      id: 3,
      title: "Junior Data Executive",
      date: "2016 - 2018",
      description: "Started the journey with a focus on accuracy and speed in digital operations, quickly becoming the top-rated executive in the department.",
      color: "#9CA3AF"
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [siteReady, setSiteReady] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all images from database
  const preloadImages = useCallback(async (imageSources: string[]) => {
    const uniqueSources = [...new Set(imageSources.filter(src => src && src.startsWith('http')))];
    if (uniqueSources.length === 0) {
      setImagesLoaded(true);
      return;
    }

    try {
      await Promise.all(
        uniqueSources.map((src) => {
          return new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve even on error to prevent hanging
            img.src = src;
          });
        })
      );
    } catch (error) {
      console.log('Some images failed to preload');
    }
    setImagesLoaded(true);
  }, []);

  // Sync data with Firestore
  useEffect(() => {
    // Prevent default content flash by keeping loading true initially
    setIsLoading(true);

    const docRef = doc(db, "site_data", "main");

    // Initial fetch
    getDoc(docRef).then(async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.content) setContent(data.content);
        if (data.socials) setSocials(data.socials);
        if (data.certificates) setCertificates(data.certificates);
        if (data.experiences) setExperiences(data.experiences);
        if (data.adminPassword) setAdminPassword(data.adminPassword);

        // Collect all image URLs to preload
        const imageUrls: string[] = [];
        if (data.content?.heroImage) imageUrls.push(data.content.heroImage);
        if (data.certificates) {
          data.certificates.forEach((cert: any) => {
            if (cert.image) imageUrls.push(cert.image);
          });
        }

        // Wait for images to load before showing site
        await preloadImages(imageUrls);
      } else {
        // If no data exists, we are ready with defaults
        setImagesLoaded(true);
      }
      setIsLoading(false);
    });

    // Real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.content) setContent(data.content);
        if (data.socials) setSocials(data.socials);
        if (data.certificates) setCertificates(data.certificates);
        if (data.experiences) setExperiences(data.experiences);
        if (data.adminPassword) setAdminPassword(data.adminPassword);
      }
    });

    return () => unsubscribe();
  }, [preloadImages]);

  const saveToFirebase = async (newData: any) => {
    try {
      const docRef = doc(db, "site_data", "main");
      await setDoc(docRef, newData, { merge: true });
    } catch (err) {
      console.error("Error saving to Firebase:", err);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.secure_url;
  };

  const addCertificate = () => {
    const newCert = {
      id: Date.now(),
      title: "New Certificate",
      image: "/support_agent.png"
    };
    const newCerts = [...certificates, newCert];
    setCertificates(newCerts);
    saveToFirebase({ certificates: newCerts });
    setActiveIndex(newCerts.length - 1);
  };

  const deleteCertificate = (id: number) => {
    if (certificates.length <= 1) return;
    const newCerts = certificates.filter(c => c.id !== id);
    setCertificates(newCerts);
    saveToFirebase({ certificates: newCerts });
    setActiveIndex(0);
  };

  const handleImageUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        const newCerts = certificates.map(c => c.id === id ? { ...c, image: url } : c);
        setCertificates(newCerts);
        saveToFirebase({ certificates: newCerts });
      } catch (err) {
        alert("Image upload failed");
      }
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        const newContent = { ...content, heroImage: url };
        setContent(newContent);
        saveToFirebase({ content: newContent });
      } catch (err) {
        alert("Hero image upload failed");
      }
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadToCloudinary(file);
        const newContent = { ...content, cvUrl: url };
        setContent(newContent);
        saveToFirebase({ content: newContent });
      } catch (err) {
        alert("CV upload failed");
      }
    }
  };

  const updateSocialUrl = (name: string, newUrl: string) => {
    const newSocials = socials.map(s => s.name === name ? { ...s, url: newUrl } : s);
    setSocials(newSocials);
    saveToFirebase({ socials: newSocials });
  };

  const toggleSocialVisibility = (name: string) => {
    const newSocials = socials.map(s => s.name === name ? { ...s, hidden: !s.hidden } : s);
    setSocials(newSocials);
    saveToFirebase({ socials: newSocials });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "New Position",
      date: "Year - Year",
      description: "Add description here...",
      color: "#28A745"
    };
    const newExperiences = [...experiences, newExp];
    setExperiences(newExperiences);
    saveToFirebase({ experiences: newExperiences });
  };

  const deleteExperience = (id: number) => {
    const newExperiences = experiences.filter(e => e.id !== id);
    setExperiences(newExperiences);
    saveToFirebase({ experiences: newExperiences });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPassword("");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setAdminPassword(newPassword);
    await saveToFirebase({ adminPassword: newPassword });
    setShowPasswordChangeModal(false);
    setNewPassword("");
    setError("");
    alert("Password changed successfully!");
  };

  const updateContent = (key: keyof typeof content, value: string) => {
    const newContent = { ...content, [key]: value };
    setContent(newContent);
    saveToFirebase({ content: newContent });
  };

  const EditableText = ({ id, value, className = "", multiline = false, onUpdate }: { id?: keyof typeof content, value: string, className?: string, multiline?: boolean, onUpdate?: (val: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    // Sync tempValue with value prop when it changes externally
    useEffect(() => {
      setTempValue(value);
    }, [value]);

    const handleBlur = () => {
      if (onUpdate) {
        onUpdate(tempValue);
      } else if (id) {
        updateContent(id, tempValue);
      }
      setIsEditing(false);
    };

    if (isEditing) {
      return multiline ? (
        <textarea
          autoFocus
          className={`bg-white text-black p-2 rounded w-full border-2 border-[#28A745] min-h-[100px] z-[50] relative ${className}`}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
        />
      ) : (
        <input
          autoFocus
          className={`bg-white text-black p-2 rounded border-2 border-[#28A745] z-[50] relative ${className}`}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        />
      );
    }

    return (
      <div className={`relative group ${className}`}>
        {multiline ? (
          <div className="whitespace-pre-line">{value}</div>
        ) : (
          <span>{value}</span>
        )}
        {isEditMode && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-black hover:text-[#28A745] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Track when site is fully ready
  useEffect(() => {
    if (!isLoading && imagesLoaded) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setSiteReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, imagesLoaded]);

  // Loading Screen Component
  const LoadingScreen = () => (
    <div className="fixed inset-0 z-[200] loading-gradient flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="loading-pulse mb-8">
          <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">
            {content.brandFirst}
          </div>
          <div className="text-5xl md:text-7xl font-black italic tracking-tighter text-white/80 -mt-2">
            {content.brandSecond}
          </div>
        </div>

        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full loading-spinner"></div>
        </div>

        {/* Loading Text with Dots */}
        <div className="flex items-center justify-center gap-2 text-white font-bold uppercase tracking-widest text-sm">
          <span>Loading</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-white rounded-full loading-dot"></span>
            <span className="w-2 h-2 bg-white rounded-full loading-dot"></span>
            <span className="w-2 h-2 bg-white rounded-full loading-dot"></span>
          </div>
        </div>

        {/* Subtext */}
        <p className="text-white/60 text-xs mt-4 font-medium">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
  return (
    <>
      {/* Loading Screen */}
      <AnimatePresence>
        {!siteReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`min-h-screen bg-white transition-all duration-300 ${siteReady ? 'page-enter' : 'opacity-0'} ${isEditMode ? 'pl-[280px]' : ''}`}>
        {/* Admin Dashboard Sidebar/Overlay */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#1a1a2e] z-[100] shadow-2xl border-r border-white/10 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-[#16213e] border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-[#28A745] rounded-full animate-pulse shadow-[0_0_10px_#28A745]"></div>
                  <h2 className="text-white font-black uppercase tracking-wider text-sm">Admin Panel</h2>
                </div>
                <p className="text-white/40 text-xs font-mono">v2.0.0 • Secure Mode</p>
              </div>

              {/* Actions */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2 pl-2">Content controls</div>

                <button
                  onClick={addCertificate}
                  className="w-full bg-white/5 hover:bg-[#28A745] text-white p-3 rounded-xl flex items-center gap-3 transition-all group border border-white/5 hover:border-[#28A745]/50"
                >
                  <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Add Certificate</div>
                    <div className="text-[10px] text-white/50 group-hover:text-white/80">New carousel item</div>
                  </div>
                </button>

                <button
                  onClick={addExperience}
                  className="w-full bg-white/5 hover:bg-[#28A745] text-white p-3 rounded-xl flex items-center gap-3 transition-all group border border-white/5 hover:border-[#28A745]/50"
                >
                  <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Add Experience</div>
                    <div className="text-[10px] text-white/50 group-hover:text-white/80">New timeline entry</div>
                  </div>
                </button>

                <button
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="w-full bg-white/5 hover:bg-[#2D2D7B] text-white p-3 rounded-xl flex items-center gap-3 transition-all group border border-white/5 hover:border-[#2D2D7B]/50"
                >
                  <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">Security</div>
                    <div className="text-[10px] text-white/50 group-hover:text-white/80">Update password</div>
                  </div>
                </button>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-[#16213e] border-t border-white/10">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm border border-red-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                  </svg>
                  EXIT ADMIN
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Navbar - Transparent */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isEditMode ? 'ml-[280px]' : ''}`}>

          <div className="bg-transparent backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
              <div className="flex flex-col cursor-pointer leading-tight group" onDoubleClick={() => !isEditMode && setShowPasswordModal(true)}>
                <div className="text-xl md:text-2xl font-black italic tracking-tighter text-[#2D2D7B]">
                  <EditableText id="brandFirst" value={content.brandFirst} />
                </div>
                <div className="text-xl md:text-2xl font-black italic tracking-tighter text-[#28A745] -mt-1">
                  <EditableText id="brandSecond" value={content.brandSecond} />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-10">
                {['Home', 'About', 'Certificates', 'Experience', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href={item === 'About' ? '#home' : `#${item.toLowerCase()}`}
                    className="text-[#2D2D7B] font-bold hover:text-[#28A745] transition-colors text-sm uppercase tracking-widest"
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => !isEditMode && window.open(content.cvUrl, '_blank')}
                  className="bg-[#28A745] text-white px-6 md:px-8 py-3 rounded-full font-bold text-sm hover:bg-[#2D2D7B] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#28A745]/30 flex items-center gap-2"
                >
                  <span>MY CV</span>
                  {isEditMode && (
                    <label className="cursor-pointer ml-2 hover:text-white/80 transition-colors">
                      <input type="file" className="hidden" accept=".pdf" onChange={handleCVUpload} />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </label>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
        {/* Header section with full width */}
        <section id="home" className="relative w-full pt-28 md:pt-40 overflow-visible">
          <div className="flex flex-col md:flex-row items-center">
            {/* Left Side - Text Content */}
            <div className="w-full md:w-1/2 flex justify-end">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={siteReady ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full md:max-w-xl pr-4 md:pr-0"
              >
                <div className="bg-[#2D2D7B] rounded-tr-[40px] rounded-br-[40px] p-8 md:p-12 shadow-2xl">
                  <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-tight mb-8 uppercase">
                    <EditableText id="heroHeading" value={content.heroHeading} multiline />
                  </h1>
                  <div className="bg-[#28A745] py-4 px-8 rounded-2xl shadow-lg">
                    <div className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide">
                      <EditableText id="heroSubheading" value={content.heroSubheading} className="inline-block relative pr-10" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="w-full md:w-1/2 relative mt-12 md:mt-0 px-6 md:px-0 flex justify-center md:justify-start">
              <div className="relative inline-block">
                {/* Green Border Decoration */}
                <div className="absolute -top-6 -right-6 w-[80%] h-[110%] border-t-[8px] border-r-[8px] border-[#28A745] rounded-tr-[60px] pointer-events-none z-0"></div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={siteReady ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative z-10 group"
                >
                  <div className="relative rounded-[40px] overflow-hidden">
                    <Image
                      src={content.heroImage}
                      alt="Support Agent"
                      width={500}
                      height={600}
                      className="object-contain max-w-full h-auto"
                      priority
                    />
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-[#2D2D7B] p-4 rounded-full hover:bg-[#28A745] hover:text-white transition-all shadow-2xl transform scale-110">
                          <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </label>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Features Section */}
        <section className="max-w-[1400px] mx-auto px-4 py-12">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={siteReady ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#2D2D7B] rounded-3xl p-8 md:p-10 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-16">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 rounded-full bg-[#28A745] mt-2 flex-shrink-0"></div>
                <div className="text-white text-lg font-medium"><EditableText id="feature1" value={content.feature1} /></div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 rounded-full bg-[#28A745] mt-2 flex-shrink-0"></div>
                <div className="text-white text-lg font-medium"><EditableText id="feature2" value={content.feature2} /></div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 rounded-full bg-[#28A745] mt-2 flex-shrink-0"></div>
                <div className="text-white text-lg font-medium"><EditableText id="feature3" value={content.feature3} /></div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 rounded-full bg-[#28A745] mt-2 flex-shrink-0"></div>
                <div className="text-white text-lg font-medium"><EditableText id="feature4" value={content.feature4} /></div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Certificates Section */}
        <section id="certificates" className="py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="text-4xl md:text-5xl font-black text-[#2D2D7B] mb-4 uppercase">
                <EditableText id="certTitle" value={content.certTitle} />
              </div>
              <div className="w-24 h-2 bg-[#28A745] mx-auto rounded-full mb-8"></div>
              {isEditMode && (
                <button
                  onClick={addCertificate}
                  className="bg-[#28A745] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-[#2D2D7B] transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  ADD NEW CERTIFICATE
                </button>
              )}
            </motion.div>

            {/* Carousel */}
            <div className="relative flex items-center justify-center min-h-[450px] md:min-h-[550px]">
              <div className="flex items-center justify-center gap-4 md:gap-12 w-full">
                {[-1, 0, 1].map((offset) => {
                  const index = (activeIndex + offset + certificates.length) % certificates.length;
                  const certificate = certificates[index];
                  const isActive = offset === 0;

                  return (
                    <motion.div
                      key={`${index}-${offset}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isActive ? 1 : 0.5,
                        scale: isActive ? 1.1 : 0.85,
                        zIndex: isActive ? 20 : 10,
                        x: offset * 20
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`relative flex-shrink-0 w-[400px] md:w-[650px] aspect-[16/9] rounded-3xl shadow-2xl bg-white border-4 ${isActive ? 'border-[#28A745]' : 'border-transparent cursor-pointer'}`}
                      onClick={() => {
                        if (!isActive) {
                          setActiveIndex(index);
                        } else if (!isEditMode) {
                          setSelectedCertificate(certificate);
                        }
                      }}
                    >
                      <Image
                        src={certificate.image}
                        alt={certificate.title}
                        fill
                        className="object-contain p-4"
                      />
                      {isEditMode && isActive && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 transition-all p-6 ring-4 ring-[#28A745] ring-inset">
                          <div className="w-full mb-4">
                            <label className="text-white text-xs font-bold uppercase mb-2 block">Certificate Title</label>
                            <EditableText
                              value={certificate.title}
                              className="text-white bg-white/20 rounded p-2 w-full"
                              onUpdate={(val) => {
                                const newCerts = certificates.map(c => c.id === certificate.id ? { ...c, title: val } : c);
                                setCertificates(newCerts);
                                saveToFirebase({ certificates: newCerts });
                              }}
                            />
                          </div>
                          <div className="flex gap-4">
                            <label className="cursor-pointer bg-white text-[#2D2D7B] p-3 rounded-full hover:bg-[#28A745] hover:text-white transition-all shadow-xl" title="Change Image">
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(certificate.id, e)} />
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                            </label>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteCertificate(certificate.id); }}
                              className="bg-white text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl"
                              title="Delete Certificate"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Custom Pagination */}
            <div className="mt-16 flex items-center justify-center gap-8">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length)}
                className="p-4 rounded-full bg-[#2D2D7B] text-white shadow-xl hover:bg-[#28A745] transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="flex items-center gap-6">
                {certificates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`font-black transition-all duration-300 ${activeIndex === idx
                      ? "text-4xl text-[#28A745] scale-125"
                      : "text-2xl text-[#2D2D7B] hover:text-[#28A745]"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % certificates.length)}
                className="p-4 rounded-full bg-[#2D2D7B] text-white shadow-xl hover:bg-[#28A745] transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="text-4xl md:text-5xl font-black text-[#2D2D7B] mb-4 uppercase text-center flex justify-center">
                <EditableText id="expTitle" value={content.expTitle} />
              </div>
              <div className="w-24 h-2 bg-[#28A745] mx-auto rounded-full mb-8"></div>
              {isEditMode && (
                <button
                  onClick={addExperience}
                  className="bg-[#2D2D7B] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-[#28A745] transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  ADD NEW EXPERIENCE
                </button>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-1 max-w-4xl mx-auto">
              {/* Experience Content - Full Width Timeline */}
              <div className="space-y-12 bg-white p-10 md:p-16 rounded-[40px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#28A745]/5 rounded-bl-full"></div>

                {experiences.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-12 border-l-4" style={{ borderColor: `${exp.color}33` }}>
                    <div
                      className="absolute -left-[14px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-lg"
                      style={{ backgroundColor: exp.color }}
                    ></div>
                    <div className="relative group">
                      <div className="flex justify-between items-start">
                        {isEditMode && (
                          <button
                            onClick={() => deleteExperience(exp.id)}
                            className="absolute -left-[70px] top-0 text-red-500 p-2 hover:bg-red-50 rounded-full transition-all group-hover:scale-110"
                            title="Delete Experience"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                        <div className="flex-1">
                          <h4 className="text-3xl font-black text-[#2D2D7B]">
                            <EditableText
                              value={exp.title}
                              onUpdate={(val) => {
                                const newExps = experiences.map(e => e.id === exp.id ? { ...e, title: val } : e);
                                setExperiences(newExps);
                                saveToFirebase({ experiences: newExps });
                              }}
                            />
                          </h4>
                          <div className="font-bold text-lg mb-4" style={{ color: exp.color }}>
                            <EditableText
                              value={exp.date}
                              onUpdate={(val) => {
                                const newExps = experiences.map(e => e.id === exp.id ? { ...e, date: val } : e);
                                setExperiences(newExps);
                                saveToFirebase({ experiences: newExps });
                              }}
                            />
                          </div>
                          <div className="text-gray-600 leading-relaxed text-lg">
                            <EditableText
                              value={exp.description}
                              multiline
                              onUpdate={(val) => {
                                const newExps = experiences.map(e => e.id === exp.id ? { ...e, description: val } : e);
                                setExperiences(newExps);
                                saveToFirebase({ experiences: newExps });
                              }}
                            />
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer id="contact" className="bg-[#2D2D7B] text-white pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 text-center md:text-left">
              {/* Column 1: Brand */}
              <div className="space-y-6">
                <h2 className="text-3xl font-black tracking-tighter italic">
                  <EditableText id="brandFirst" value={content.brandFirst} className="inline" />
                  <br />
                  <span className="text-[#28A745]">
                    <EditableText id="brandSecond" value={content.brandSecond} className="inline" />
                  </span>
                </h2>
                <div className="text-gray-300 leading-relaxed pr-4">
                  <EditableText id="footerDesc" value={content.footerDesc} multiline />
                </div>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    (!social.hidden || isEditMode) && (
                      <div key={social.name} className={`relative group ${social.hidden ? 'opacity-40 grayscale' : ''}`}>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#28A745] transition-all hover:scale-110 active:scale-95 shadow-lg border border-white/5"
                        >
                          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <path d={social.path} />
                          </svg>
                        </a>
                        {isEditMode && (
                          <>
                            <button
                              onClick={() => toggleSocialVisibility(social.name)}
                              className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-[#2D2D7B] p-1.5 rounded-full shadow-lg hover:text-[#28A745] transition-colors z-30"
                              title={social.hidden ? "Show" : "Hide"}
                            >
                              {social.hidden ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-2 rounded-lg shadow-xl z-20 transition-opacity ${social.name === 'facebook' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-active:opacity-100'}`}>
                              <input
                                type="text"
                                className="w-full text-xs p-1 border rounded"
                                value={social.url}
                                onChange={(e) => updateSocialUrl(social.name, e.target.value)}
                                placeholder={`Enter ${social.name} URL`}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  ))}
                </div>
                {isEditMode && (
                  <button
                    onClick={() => setShowUrlModal(true)}
                    className="bg-[#28A745] text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-white hover:text-[#2D2D7B] transition-all shadow-lg active:scale-95"
                  >
                    ENTER URLS
                  </button>
                )}
              </div>

              {/* Column 2: Quick Links */}
              <div>
                <h3 className="text-xl font-bold mb-8 border-b-2 border-[#28A745] inline-block pb-2">Quick Links</h3>
                <ul className="space-y-4">
                  {['Home', 'About Us', 'Certificates', 'Experience', 'Contact'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-300 hover:text-[#28A745] transition-colors flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#28A745]"></span>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>



              {/* Column 4: Contact Info */}
              <div>
                <h3 className="text-xl font-bold mb-8 border-b-2 border-[#28A745] inline-block pb-2">Get In Touch</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 justify-center md:justify-start">
                    <div className="mt-1 w-5 h-5 bg-[#28A745]/20 rounded flex items-center justify-center text-[#28A745] font-bold">📍</div>
                    <div className="text-gray-300"><EditableText id="footerAddress" value={content.footerAddress} /></div>
                  </li>
                  <li className="flex items-start gap-4 justify-center md:justify-start">
                    <div className="mt-1 w-5 h-5 bg-[#28A745]/20 rounded flex items-center justify-center text-[#28A745] font-bold">📞</div>
                    <div className="text-gray-300"><EditableText id="footerPhone" value={content.footerPhone} /></div>
                  </li>
                  <li className="flex items-start gap-4 justify-center md:justify-start">
                    <div className="mt-1 w-5 h-5 bg-[#28A745]/20 rounded flex items-center justify-center text-[#28A745] font-bold">📧</div>
                    <div className="text-gray-300"><EditableText id="footerEmail" value={content.footerEmail} /></div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-sm">
                <EditableText id="footerCopyright" value={content.footerCopyright} />
              </div>
              <div className="flex gap-8 text-sm text-gray-400">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Password Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md"
              >
                <h3 className="text-2xl font-black text-[#2D2D7B] mb-6">Enter Admin Password</h3>
                <form onSubmit={handlePasswordSubmit}>
                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    className="w-full bg-gray-100 border-2 border-transparent focus:border-[#28A745] outline-none rounded-xl p-4 mb-4 text-[#2D2D7B] font-bold transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#28A745] text-white font-bold py-4 rounded-xl hover:bg-[#2D2D7B] transition-all shadow-lg shadow-[#28A745]/20"
                    >
                      Enter Edit Mode
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showPasswordChangeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md"
              >
                <h3 className="text-2xl font-black text-[#2D2D7B] mb-6">Change Admin Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <input
                    type="password"
                    placeholder="Enter New Password (min 4 chars)"
                    className="w-full bg-gray-100 border-2 border-transparent focus:border-[#28A745] outline-none rounded-xl p-4 mb-4 text-[#2D2D7B] font-bold transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                  {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setShowPasswordChangeModal(false); setError(""); }}
                      className="flex-1 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#2D2D7B] text-white font-bold py-4 rounded-xl hover:bg-[#28A745] transition-all shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* URL Management Modal */}
        <AnimatePresence>
          {showUrlModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] p-10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-black text-[#2D2D7B] uppercase tracking-tighter italic">URL <span className="text-[#28A745]">MANAGER</span></h3>
                  <button onClick={() => setShowUrlModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-[#2D2D7B] uppercase mb-2 block tracking-widest">CV URL (PDF)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#28A745] outline-none rounded-2xl p-4 text-[#2D2D7B] font-bold transition-all"
                      value={content.cvUrl}
                      onChange={(e) => updateContent('cvUrl', e.target.value)}
                      placeholder="Enter PDF URL"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socials.map((social) => (
                      <div key={social.name}>
                        <label className="text-xs font-black text-[#2D2D7B] uppercase mb-2 block tracking-widest">{social.name} URL</label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-[#28A745] outline-none rounded-2xl p-4 text-[#2D2D7B] font-bold transition-all"
                          value={social.url}
                          onChange={(e) => updateSocialUrl(social.name, e.target.value)}
                          placeholder={`Enter ${social.name} URL`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={() => setShowUrlModal(false)}
                    className="w-full bg-[#2D2D7B] text-white font-black py-5 rounded-2xl hover:bg-[#28A745] transition-all shadow-xl shadow-[#2D2D7B]/20 uppercase tracking-widest"
                  >
                    SAVE & CLOSE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx global>{`
        body {
          overflow-x: hidden;
          background-color: #f8f9fa;
        }
      `}</style>
        {/* Certificate Enlarged View Modal */}
        <AnimatePresence>
          {selectedCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-5xl flex flex-col items-center"
              >
                {/* Title Section */}
                <div className="text-center mb-6">
                  <h2 className="text-4xl md:text-6xl font-black text-[#2D2D7B] mb-4 uppercase tracking-tighter">
                    {selectedCertificate.title}
                  </h2>
                  <div className="w-24 h-2 bg-[#28A745] mx-auto rounded-full"></div>
                </div>

                {/* Back Home Button */}
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="mb-10 bg-[#2D2D7B] text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-[#28A745] transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-[#2D2D7B]/20 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  BACK TO HOME
                </button>

                {/* Image Container */}
                <div className="relative w-full aspect-[4/3] max-h-[65vh] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white border-[12px] border-gray-50 flex items-center justify-center">
                  <Image
                    src={selectedCertificate.image}
                    alt={selectedCertificate.title}
                    fill
                    className="object-contain p-4 md:p-12"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main >
    </>
  );
}
