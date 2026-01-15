"use client"

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { AnimatedText } from "@/components/ui/animated-text";
import { Button } from "@/components/ui/stateful-button"
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter()

  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
      router.push('/auth');
    });
  };
  // TODO: Pull dynamically from DB, kept static for now
  const featuredAuthors = [
    {
      name: "Octavia E. Butler",
      description: "Visionary sci-fi writer known for Kindred and the Parable series.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Ursula K. Le Guin",
      description: "Pioneer of speculative fiction and human-centered worldbuilding.",
      image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Toni Morrison",
      description: "Nobel Prize winner whose novels explore memory and identity.",
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Haruki Murakami",
      description: "Surreal, melodic storytelling that blends the everyday with the strange.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col justify-center space-y-8">
            <div className="text-5xl md:text-6xl lg:text-7xl font-bold">
              <AnimatedText text="Bookdex" />
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-md">
              Discover books by price, author, and theme — instantly.
            </p>
            <Button onClick={handleClick} className="px-8 py-3 text-lg w-fit">
              Get Started
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Featured authors
              </p>
              <div className="grid grid-cols-2 gap-6">
                {featuredAuthors.map((author) => (
                  <div key={author.name} className="flex flex-col items-center text-center">
                    <img
                      src={author.image}
                      alt={author.name}
                      className="w-28 h-28 rounded-full object-cover mb-2 shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md ring-0 hover:ring-2 hover:ring-blue-400"
                    />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{author.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200/80 dark:border-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Inspired by the greatest minds
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </div>
    </div>
  );
}
