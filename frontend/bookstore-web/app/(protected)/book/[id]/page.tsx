"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getJSON } from "@/app/utils";
import { bookSchema } from "@/app/schema";
import { useCart } from "@/app/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type BookResponse = ReturnType<typeof bookSchema.parse>;

function BookHeader({ book }: { book: BookResponse }) {
  return (
    <Card className="mb-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {book.title}
        </CardTitle>
        <CardDescription className="mt-2 text-lg">
          by{" "}
          <Link href={`/author/${book.author_id}`} className="text-blue-600 hover:underline">
            {book.author_name}
          </Link>
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
    const bookId = params.id as string;
    const { addItem } = useCart();

    const [book, setBook] = useState<BookResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadBook = async () => {
            try {
                const response = await getJSON<BookResponse>(`/books/${bookId}`);
                if (isMounted) {
                    setBook(response);
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

    if (error) {
        return <p>{error}</p>;
    }

    if (!book) {
        return <p>Loading...</p>;
    }

    return (
        <div className="p-4">
            <BookHeader book={book} />
            <Card className="container">
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                        <div>
                            <strong>Price:</strong> ${book.price.toFixed(2)}
                        </div>
                        <div>
                            <strong>Published Date:</strong>{" "}
                            {book.published_date ? new Date(book.published_date).toLocaleDateString() : "Unknown"}
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                <Link href="/home" className="text-blue-600 hover:underline">Back to Home</Link>
            </div>
        </div>
    );
}