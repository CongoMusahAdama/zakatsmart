'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
}

export const ScrollReveal = ({
    children,
    width = "100%",
    direction = "up",
    delay = 0,
    duration = 0.8
}: ScrollRevealProps) => {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction]
            }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};
