"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJSON } from "@/app/utils";
import { bookSchema } from "@/app/schema";
import { useCart } from "@/app/CartContext";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/app/BreadcrumbContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type BookResponse = ReturnType<typeof bookSchema.parse>;

function BookHeader({ book }: { book: BookResponse }) {
  const router = useRouter();

  return (
    <Card className="mb-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {book.title}
        </CardTitle>
        <CardDescription className="mt-2 text-lg">
          by{" "}
          <button
            onClick={() => router.push(`/author/${book.author_id}`)}
            className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            {book.author_name}
          </button>
        </CardDescription>
      </CardHeader>
      {book.description && (
        <CardContent className="text-center">
          <p className="text-base">{book.description}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.id as string;
    const { addItem } = useCart();
    const { setTitle } = useBreadcrumb();

    const [book, setBook] = useState<BookResponse | null>(null);
    const [otherBooks, setOtherBooks] = useState<BookResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadBook = async () => {
            try {
                const response = await getJSON<BookResponse>(`/books/${bookId}`);
                if (isMounted) {
                    setBook(response);
                    setTitle(response.title);
                }
            } catch (err) {
                console.error("Failed to load book:", err);
                if (isMounted) {
                    setError("Failed to load book details. Please try again.");
                }
            }
        };

        if (bookId) {
            loadBook();
        }

        return () => {
            isMounted = false;
        };
    }, [bookId]);

    useEffect(() => {
        if (!book) return;

        let isMounted = true;

        const loadOtherBooks = async () => {
            try {
                const response = await getJSON<BookResponse[]>(`/authors/${book.author_id}/books`);
                if (isMounted) {
                    const filtered = response.filter(b => b.id !== book.id).slice(0, 3);
                    setOtherBooks(filtered);
                }
            } catch (err) {
                console.error("Failed to load other books:", err);
                // No error state for this, just log
            }
        };

        loadOtherBooks();

        return () => {
            isMounted = false;
        };
    }, [book]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!book) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <BookHeader book={book} />
            <Card className="container">
                <CardHeader>
                    <CardTitle>Book Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                        <div>
                            <strong>Price:</strong> £{book.price.toFixed(2)}
                        </div>
                        <div>
                            <strong>Published Date:</strong>{" "}
                            {book.published_date ? new Date(book.published_date).toLocaleDateString() : "Unknown"}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {otherBooks.length > 0 && (
                <Card className="container mt-6">
                    <CardHeader>
                        <CardTitle>More by {book.author_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {otherBooks.map((otherBook) => (
                                <li key={otherBook.id}>
                                    <button
                                        onClick={() => router.push(`/book/${otherBook.id}`)}
                                        className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        {otherBook.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
            <div className="mt-4">
                <Button
                    onClick={() => {
                        if (book) {
                            addItem({
                                id: book.id,
                                title: book.title,
                                price: book.price,
                            });
                        }
                    }}
                    className="mr-4"
                >
                    Add to Cart
                </Button>
                <button
                  onClick={() => router.push("/home")}
                  className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Continue Browsing
                </button>
            </div>
        </div>
    );
}
