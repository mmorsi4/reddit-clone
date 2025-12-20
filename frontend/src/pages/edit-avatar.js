import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header"
import DefaultAvatarSVG from "../components/DefaultAvatarSVG";


const AvatarCustomizer = ({ headerAvatarRef }) => {
    const [activeTab, setActiveTab] = useState("Outfits");
    const [layers, setLayers] = useState({});
    const avatarGridRef = useRef(null);
    const layerContainerRef = useRef(null);
    const navigate = useNavigate();
    const baseAvatarArea = useRef({ offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0 });


    const PLACEMENTS = {
        Hair: { top: 4, left: -4, width: 100, height: 100 },
        Tops: { top: 52, left: 33, width: 39, height: 45 },
        Bottoms: { top: 66, left: 39, width: 26, height: 40 },
    };



    const avatarSets = {
        Tops: ["../images/top1.png", "../images/top2.png", "../images/top3.png", "../images/top4.png"],
        Bottoms: ["../images/bottom1.png", "../images/bottom2.png", "../images/bottom3.png", "../images/bottom4.png"],
        Hair: ["../images/hair1.png", "../images/hair2.png", "../images/hair3.png", "../images/hair4.png"],
    };

    const layerOrder = {
        Backgrounds: 0,
        Bottoms: 1,
        Hair: 2,
        Tops: 3,
    };

    // 🟠 Load saved avatar AND layers on mount
    useEffect(() => {
        // Load saved avatar image
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar && headerAvatarRef?.current) {
            headerAvatarRef.current.src = savedAvatar;
        }

        // 🆕 Load saved layers so avatar remembers outfits
        const savedLayers = localStorage.getItem("avatarLayers");
        if (savedLayers) {
            try {
                setLayers(JSON.parse(savedLayers));
            } catch (error) {
                console.error('Error loading saved layers:', error);
            }
        }
    }, [headerAvatarRef]);

    // 🧱 Add or replace a layer OR REMOVE it if it's the same item
    const addOrReplaceLayer = (category, src) => {
        let newLayers;

        // Check if the layer for this category and src already exists (i.e., it's currently selected)
        if (layers[category] && layers[category].src === src) {
            // If it exists and the src is the same, remove it (toggle off)
            newLayers = { ...layers };
            delete newLayers[category]; // Remove the layer for this category
        } else {
            // Otherwise, add or replace the layer (toggle on)
            newLayers = {
                ...layers,
                [category]: { src, zIndex: layerOrder[category] || 1 },
            };
        }

        setLayers(newLayers);

        // 🆕 Immediately save layers to localStorage
        localStorage.setItem("avatarLayers", JSON.stringify(newLayers));
    };


    const handleSave = async () => {
        const size = 256; // canvas resolution
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;

        try {
            // 1️⃣ Background
            ctx.fillStyle = "#ab3cb7ff";
            ctx.fillRect(0, 0, size, size);

            // 2️⃣ Base avatar
            const baseImg = new Image();
            baseImg.src = process.env.PUBLIC_URL + "/images/default.PNG";
            await new Promise((resolve, reject) => {
                baseImg.onload = () => {
                    const aspect = baseImg.naturalWidth / baseImg.naturalHeight;

                    let drawWidth, drawHeight;
                    if (aspect > 1) {
                        drawWidth = size;
                        drawHeight = size / aspect;
                    } else {
                        drawHeight = size;
                        drawWidth = size * aspect;
                    }

                    const offsetX = (size - drawWidth) / 2;
                    const offsetY = (size - drawHeight) / 2;

                    // Draw base
                    ctx.drawImage(baseImg, offsetX, offsetY, drawWidth, drawHeight);

                    // Save these for layers
                    baseAvatarArea.current = { offsetX, offsetY, drawWidth, drawHeight };
                    resolve();
                };
                baseImg.onerror = reject;
            });



            // 3️⃣ Draw layers using PLACEMENTS
            const orderedLayers = Object.entries(layers).sort(
                (a, b) => a[1].zIndex - b[1].zIndex
            );

            for (const [category, data] of orderedLayers) {
    const p = PLACEMENTS[category];
    if (!p) continue;

    await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = data.src;
        img.onload = () => {
            const p = PLACEMENTS[category];
let top = (p.top / 100) * size;
let left = (p.left / 100) * size;
let width = (p.width / 100) * size;
let height = (p.height / 100) * size;

// Manual adjustment for Hair
if (category === "Hair") {
    top -= size * 0.10;   // move up by 5% of canvas
    left+= size *0.03;
}

            ctx.drawImage(img, left, top, width, height);
            resolve();
        };
        img.onerror = reject;
    });
}

            // 4️⃣ Export final avatar
            const finalAvatar = canvas.toDataURL("image/png");

            // 5️⃣ Save locally
            localStorage.setItem("userAvatar", finalAvatar);
            localStorage.setItem("avatarLayers", JSON.stringify(layers));

            // 6️⃣ Save to backend
            const res = await fetch("/api/users/update-avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ avatarData: finalAvatar }),
            });

            // 7️⃣ Update header & all page avatars
            updateAllAvatarImages(finalAvatar);

            if (res.ok) {
                setTimeout(async () => {
                    const me = await fetch("/api/users/me", { credentials: "include" });
                    const user = await me.json();
                    navigate(`/profile/${user.username}`);
                }, 800);
            } else {
                alert("Failed to save avatar to server");
            }
        } catch (err) {
            console.error("Avatar save error:", err);
            alert("Error generating avatar");
        }
    };


    // 🆕 Function to update ALL avatar images on the page
    const updateAllAvatarImages = (avatarSrc) => {
        // Update header avatar
        if (headerAvatarRef?.current) {
            headerAvatarRef.current.src = avatarSrc;
        }

        // Update any other avatar images on the page
        const allAvatars = document.querySelectorAll('img[class*="avatar"], img[alt*="avatar"], .profile-avatar, .comment-avatar');
        allAvatars.forEach(avatar => {
            avatar.src = avatarSrc;
        });

        // 🆕 Also update localStorage so other pages can use it
        localStorage.setItem("userAvatar", avatarSrc);
    };

    return (
        <>
            <Header />
            <Sidebar />
            <div className="main">
                <div className="avatar-preview">
                    <div
                        id="container"
                        className="flex items-center justify-center relative aspect-[3/4] h-full m-auto"
                        style={{
                            "--color-body": "#FFFFFF",
                            "--color-eyes": "#FF4500",
                            "--color-hair": "#C08D41",
                            "--color-facialhair": "#C08D41",
                        }}
                    >
                        <div ref={layerContainerRef} className="avatar-layers">
                            <DefaultAvatarSVG />
                            {Object.entries(layers).map(([category, data]) => {
                                const p = PLACEMENTS[category];
                                return (
                                    <img
                                        key={category}
                                        src={data.src}
                                        alt={category}
                                        data-category={category}
                                        style={{
                                            position: "absolute",
                                            zIndex: data.zIndex,
                                            objectFit: "contain",
                                            top: `${p.top}%`,
                                            left: `${p.left}%`,
                                            width: `${p.width}%`,
                                            height: `${p.height}%`,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <button className="save-btn" onClick={handleSave}>
                        Save
                    </button>
                </div>

                <div className="avatar-options">
                    <div className="tabs">
                        {Object.keys(avatarSets).map(tab => (
                            <button
                                key={tab}
                                className={`tab ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="avatar-grid" ref={avatarGridRef}>
                        {avatarSets[activeTab]?.map((src, i) => {
                            // Determine if this item is currently selected to apply a class
                            const isSelected = layers[activeTab] && layers[activeTab].src === src;

                            return (
                                <div
                                    key={i}
                                    className={`avatar-item ${isSelected ? "selected" : ""}`} // Apply selected class
                                    data-category={activeTab}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        onClick={() => addOrReplaceLayer(activeTab, src)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
export default AvatarCustomizer;