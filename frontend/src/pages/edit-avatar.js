import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import SearchBar from "../components/searchbar";
import Header from "../components/header"

const AvatarCustomizer = ({ headerAvatarRef }) => {
    const [activeTab, setActiveTab] = useState("Outfits");
    const [layers, setLayers] = useState({});
    const avatarGridRef = useRef(null);
    const layerContainerRef = useRef(null);

    const avatarSets = {
        Outfits: ["../images/outfit1.png", "../images/outfit2.png", "../images/outfit3.png", "../images/outfit4.png"],
        Tops: ["../images/top1.png", "../images/top2.png", "../images/top3.png", "../images/top4.png"],
        Bottoms: ["../images/bottom1.png", "../images/bottom2.png", "../images/bottom3.png", "../images/bottom4.png"],
        Hair: ["../images/hair1.png", "../images/hair2.png", "../images/hair3.png", "../images/hair4.png"],
        Face: ["../images/face1.png", "../images/face2.png", "../images/face3.png", "../images/face4.png"],
        Eyes: ["../images/eyes1.png", "../images/eyes2.png", "../images/eyes3.png", "../images/eyes4.png"],
        Hats: ["../images/hat1.png", "../images/hat2.png", "../images/hat3.png", "../images/hat4.png"],
        "Right Hand": ["../images/right1.png", "../images/right2.png", "../images/right3.png", "../images/right4.png"],
        "Left Hand": ["../images/left1.png", "../images/left2.png", "../images/left3.png", "../images/left4.png"],
        Backgrounds: ["../images/bg1.png", "../images/bg2.png", "../images/bg3.png", "../images/bg4.png"],
        Colors: ["../images/color1.png", "../images/color2.png", "../images/color3.png", "../images/color4.png"],
    };

    const layerOrder = {
        Backgrounds: 0,
        Colors: 1,
        Bottoms: 2,
        Outfits: 3,
        Tops: 4,
        "Left Hand": 5,
        "Right Hand": 6,
        Face: 7,
        Eyes: 8,
        Hair: 9,
        Hats: 10,
    };

    // 🟠 Load saved avatar on mount
    useEffect(() => {
        const savedAvatar = localStorage.getItem("userAvatar");
        if (savedAvatar && headerAvatarRef?.current) {
            headerAvatarRef.current.src = savedAvatar;
        }
    }, [headerAvatarRef]);

    // 🧱 Add or replace a layer
    const addOrReplaceLayer = (category, src) => {
        setLayers(prev => ({
            ...prev,
            [category]: { src, zIndex: layerOrder[category] || 1 },
        }));
    };

    // 💾 Save the final avatar (including default layer)
    const handleSave = () => {
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

        // Load default avatar first, then other layers
        const drawDefaultAvatar = new Promise(resolve => {
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

        drawDefaultAvatar
            .then(() =>
                Promise.all(
                    sortedLayers.map(
                        data =>
                            new Promise(resolve => {
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
                            })
                    )
                )
            )
            .then(() => {
                const finalAvatar = canvas.toDataURL("image/png");
                if (headerAvatarRef?.current) headerAvatarRef.current.src = finalAvatar;
                localStorage.setItem("userAvatar", finalAvatar);

                const saveBtn = document.querySelector(".save-btn");
                if (saveBtn) {
                    saveBtn.textContent = "Saved!";
                    saveBtn.style.backgroundColor = "#4CAF50";
                    setTimeout(() => {
                        saveBtn.textContent = "Save";
                        saveBtn.style.backgroundColor = "#ff4500";
                    }, 1200);
                }
            });
    };



    return (
        <>
            <Header />
            <Sidebar/>
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
                            <img src="../images/default.PNG" alt="Default Avatar" className="default-avatar" />
                            {Object.entries(layers).map(([category, data]) => (
                                <img
                                    key={category}
                                    src={data.src}
                                    alt={category}
                                    data-category={category}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        zIndex: data.zIndex,
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
                        {avatarSets[activeTab]?.map((src, i) => (
                            <div key={i} className="avatar-item" data-category={activeTab}>
                                <img
                                    src={src}
                                    alt=""
                                    onClick={() => addOrReplaceLayer(activeTab, src)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </>
    );
}
export default AvatarCustomizer;