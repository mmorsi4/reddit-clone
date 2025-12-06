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

    const layerPlacement = {
        Hair: { top: "4%", left: "-5%", width: "100%", height: "100%" },
        Tops: { top: "37.5%", left: "33%", width: "39%", height: "75%" },
        Bottoms: { top: "59%", left: "39%", width: "26%", height: "55%" },
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

    // 💾 Save the final avatar to localStorage AND database
    const handleSave = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 128;
        canvas.width = size;
        canvas.height = size;

        // Background color
        ctx.fillStyle = "#ab3cb7ff";
        ctx.fillRect(0, 0, size, size);

        // Define default/base avatar image
        const defaultAvatarSrc = process.env.PUBLIC_URL + "/images/default.PNG";
        // Sort layers by zIndex
        const sortedLayers = Object.entries(layers)
            .sort((a, b) => a[1].zIndex - b[1].zIndex)
            .map(([_, data]) => data);

        const zoomOutFactor = 1.3;

        try {
            // Load default avatar first, then other layers
            await new Promise(resolve => {
                const baseImg = new Image();
                baseImg.src = defaultAvatarSrc;
                baseImg.onload = () => {
                    const imgAspect = baseImg.naturalWidth / baseImg.naturalHeight;
                    let drawWidth, drawHeight;

                    if (imgAspect > 1) {
                        drawHeight = size / zoomOutFactor;
                        drawWidth = drawHeight * imgAspect;
                    } else {
                        drawWidth = size / zoomOutFactor;
                        drawHeight = drawWidth / imgAspect;
                    }

                    const offsetX = (size - drawWidth) / 2;
                    const offsetY = -drawHeight * 0.001;

                    ctx.drawImage(baseImg, offsetX, offsetY, drawWidth, drawHeight);
                    resolve();
                };
            });

            // Draw all the custom layers
            for (const data of sortedLayers) {
                await new Promise(resolve => {
                    const img = new Image();
                    img.src = data.src;
                    img.onload = () => {
                        const imgAspect = img.naturalWidth / img.naturalHeight;
                        let drawWidth, drawHeight;

                        if (imgAspect > 1) {
                            drawHeight = size / zoomOutFactor;
                            drawWidth = drawHeight * imgAspect;
                        } else {
                            drawWidth = size / zoomOutFactor;
                            drawHeight = drawWidth / imgAspect;
                        }

                        const offsetX = (size - drawWidth) / 2;
                        const offsetY = -drawHeight * 0.001;

                        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                        resolve();
                    };
                });
            }

            const finalAvatar = canvas.toDataURL("image/png");

            // 1. Save to localStorage (for immediate UI updates)
            localStorage.setItem("userAvatar", finalAvatar);

            // 🆕 Also save layers to localStorage (so avatar remembers outfits)
            localStorage.setItem("avatarLayers", JSON.stringify(layers));

            // 2. Save to database (for profile page and comments)
            const saveToDatabase = async (avatarDataUrl) => {
                try {
                    const updateRes = await fetch('http://localhost:5001/api/users/update-avatar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            avatarData: avatarDataUrl
                        })
                    });

                    if (updateRes.ok) {
                        console.log('✅ Avatar saved to database successfully!');
                        return true;
                    } else {
                        console.error('❌ Failed to save avatar to database');
                        return false;
                    }
                } catch (error) {
                    console.error('💥 Error saving avatar to database:', error);
                    return false;
                }
            };

            // Save to database
            const dbSuccess = await saveToDatabase(finalAvatar);

            // Update UI - including the header avatar!
            if (headerAvatarRef?.current) {
                headerAvatarRef.current.src = finalAvatar;
            }

            // 🆕 Update ALL avatar images on the page
            updateAllAvatarImages(finalAvatar);

            const saveBtn = document.querySelector(".save-btn");
            if (saveBtn) {
                if (dbSuccess) {
                    saveBtn.textContent = "Saved!";
                    saveBtn.style.backgroundColor = "#4CAF50";

                    setTimeout(() => {
                        fetch('http://localhost:5001/api/users/me', {
                            credentials: 'include'
                        })
                            .then(res => res.json())
                            .then(userData => {
                                navigate(`/profile/${userData.username}`);
                            })
                            .catch(err => {
                                console.error('Error fetching user data:', err);
                            });
                    }, 1200);
                } else {
                    saveBtn.textContent = "Save Failed!";
                    saveBtn.style.backgroundColor = "#ff4444";
                    setTimeout(() => {
                        saveBtn.textContent = "Save";
                        saveBtn.style.backgroundColor = "#ff4500";
                    }, 2000);
                }
            }

        } catch (error) {
            console.error('Error generating avatar:', error);
            const saveBtn = document.querySelector(".save-btn");
            if (saveBtn) {
                saveBtn.textContent = "Error!";
                saveBtn.style.backgroundColor = "#ff4444";
                setTimeout(() => {
                    saveBtn.textContent = "Save";
                    saveBtn.style.backgroundColor = "#ff4500";
                }, 2000);
            }
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
                            {Object.entries(layers).map(([category, data]) => (
                                <img
                                    key={category}
                                    src={data.src}
                                    alt={category}
                                    data-category={category}
                                    style={{
                                        position: "absolute",
                                        zIndex: data.zIndex,
                                        objectFit: "contain",

                                        top: layerPlacement[category]?.top || 0,
                                        left: layerPlacement[category]?.left || 0,
                                        width: layerPlacement[category]?.width || "100%",
                                        height: layerPlacement[category]?.height || "100%",
                                    }}
                                />
                            ))}
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