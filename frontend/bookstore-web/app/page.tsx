"use client"

import ProceduralGroundBackground from "@/components/ui/procedural-ground-background";
import Image from "next/image";
import React from "react"

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { AnimatedText } from "@/components/ui/animated-text";
import { Button } from "@/components/ui/stateful-button"


export default function Home() {
  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 4000);
    });
  };
  const testimonials = [
    {
      quote:
        "I have always imagined that Paradise will be a kind of library.",
      name: "Jorge Luis Borges",
      designation: "Writer, Librarian & Philosopher",
      src: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Until I feared I would lose it, I never loved to read. One does not love breathing.",
      name: "Harper Lee",
      designation: "Author of To Kill a Mockingbird",
      src: "https://plus.unsplash.com/premium_photo-1726768903173-8cac387e97ab?q=80&w=3988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Once you learn to read, you will be forever free.",
      name: "Frederick Douglass",
      designation: "Author & Social Reformer",
      src: "https://images.unsplash.com/photo-1768081377809-7ab64ccc493e?q=80&w=2252&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Think before you speak. Read before you think.",
      name: "Fran Lebowitz",
      designation: "Author & Public Speaker",
      src: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Books are the quietest and most constant of friends.",
      name: "Charles W. Eliot",
      designation: "Educator",
      src: "https://plus.unsplash.com/premium_photo-1664006988924-16f386bcd40e?q=80&w=3946&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  return (
    <>
      <AnimatedText text="Bookdex" />
    <AnimatedTestimonials testimonials={testimonials} />
    <div className="flex h-40 w-full items-center justify-center">
      <Button onClick={handleClick}>Get Started</Button>
    </div>
    </>
    
  );
}
