"use client";

import { useEffect, useState } from "react";
import { apiFetch, getJSON, postJSON } from "@/app/utils";
import { bookSchema } from "@/app/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


export default function AdminPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <Tabs defaultValue="books" className="w-full">
                <TabsList>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="authors">Authors</TabsTrigger>
                </TabsList>
                <TabsContent value="books">
                    <BooksManagement />
                </TabsContent>
                <TabsContent value="authors">
                    <AuthorsManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function BooksManagement() {
    type BookResponse = ReturnType<typeof bookSchema.parse>;

    const [books, setBooks] = useState<BookResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const response = await getJSON<BookResponse[]>("/books");
            setBooks(response);
        } catch (err) {
            console.error("Failed to load books:", err);
            setError("Failed to load books.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <div className="mb-4">
                <CreateBookDialog onBookCreated={loadBooks} />
            </div>
            <Table>
                <TableCaption>Books Management</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Published Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {books.map((book) => (
                        <TableRow key={book.id}>
                            <TableCell>{book.title}</TableCell>
                            <TableCell>{book.description || "-"}</TableCell>
                            <TableCell>{book.author_name}</TableCell>
                            <TableCell>${book.price.toFixed(2)}</TableCell>
                            <TableCell>{book.published_date ? new Date(book.published_date).toLocaleDateString() : "-"}</TableCell>
                            <TableCell>
                                <EditBookDialog book={book} onBookUpdated={loadBooks} />
                                <Button variant="destructive" onClick={() => deleteBook(book.id, loadBooks)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function CreateBookDialog({ onBookCreated }: { onBookCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [publishedDate, setPublishedDate] = useState("");
    const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
    const [authorsError, setAuthorsError] = useState<string | null>(null);

    useEffect(() => {
        const loadAuthors = async () => {
            try {
                const response = await getJSON<{ id: string; name: string }[]>("/authors");
                setAuthors(response);
            } catch (err) {
                console.error("Failed to load authors:", err);
                setAuthorsError("Failed to load authors.");
            }
        };
        loadAuthors();
    }, []);

    const handleSubmit = async () => {
        try {
            if (!authorId) {
                setAuthorsError("Author is required.");
                return;
            }
            await postJSON("/books", {
                title,
                description: description || null,
                price: parseFloat(price),
                author_id: authorId,
                published_date: publishedDate || null,
            });
            setOpen(false);
            onBookCreated();
        } catch (err) {
            console.error("Failed to create book:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Book</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Book</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Label>Price</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <Label>Author</Label>
                    <select
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                    >
                        <option value="">Select an author</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                    {authorsError ? <p className="text-sm text-destructive">{authorsError}</p> : null}
                    <Label>Published Date</Label>
                    <Input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
                    <Button onClick={handleSubmit}>Create</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EditBookDialog({ book, onBookUpdated }: { book: any; onBookUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(book.title);
    const [description, setDescription] = useState(book.description || "");
    const [price, setPrice] = useState(book.price.toString());
    const [authorId, setAuthorId] = useState(book.author_id);
    const [publishedDate, setPublishedDate] = useState(book.published_date || "");
    const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
    const [authorsError, setAuthorsError] = useState<string | null>(null);

    useEffect(() => {
        const loadAuthors = async () => {
            try {
                const response = await getJSON<{ id: string; name: string }[]>("/authors");
                setAuthors(response);
            } catch (err) {
                console.error("Failed to load authors:", err);
                setAuthorsError("Failed to load authors.");
            }
        };
        loadAuthors();
    }, []);

    const handleSubmit = async () => {
        try {
            if (!authorId) {
                setAuthorsError("Author is required.");
                return;
            }
            await apiFetch(`/books/${book.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    description: description || null,
                    price: parseFloat(price),
                    author_id: authorId,
                    published_date: publishedDate || null,
                }),
            });
            setOpen(false);
            onBookUpdated();
        } catch (err) {
            console.error("Failed to update book:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Book</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Label>Price</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <Label>Author</Label>
                    <select
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                    >
                        <option value="">Select an author</option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.name}
                            </option>
                        ))}
                    </select>
                    {authorsError ? <p className="text-sm text-destructive">{authorsError}</p> : null}
                    <Label>Published Date</Label>
                    <Input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
                    <Button onClick={handleSubmit}>Update</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

async function deleteBook(bookId: string, onDeleted: () => void) {
    try {
        await apiFetch(`/books/${bookId}`, { method: "DELETE" });
        onDeleted();
    } catch (err) {
        console.error("Failed to delete book:", err);
    }
}

function AuthorsManagement() {
    const [authors, setAuthors] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuthors();
    }, []);

    const loadAuthors = async () => {
        try {
            const response = await getJSON<any[]>("/authors");
            setAuthors(response);
        } catch (err) {
            console.error("Failed to load authors:", err);
            setError("Failed to load authors.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <div className="mb-4">
                <CreateAuthorDialog onAuthorCreated={loadAuthors} />
            </div>
            <Table>
                <TableCaption>Authors Management</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {authors.map((author) => (
                        <TableRow key={author.id}>
                            <TableCell>{author.name}</TableCell>
                            <TableCell>{author.bio || "-"}</TableCell>
                            <TableCell>
                                <EditAuthorDialog author={author} onAuthorUpdated={loadAuthors} />
                                <Button variant="destructive" onClick={() => deleteAuthor(author.id, loadAuthors)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function CreateAuthorDialog({ onAuthorCreated }: { onAuthorCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");

    const handleSubmit = async () => {
        try {
            await postJSON("/authors", {
                name,
                bio: bio || null,
            });
            setOpen(false);
            onAuthorCreated();
        } catch (err) {
            console.error("Failed to create author:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Author</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Author</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                    <Label>Bio</Label>
                    <Input value={bio} onChange={(e) => setBio(e.target.value)} />
                    <Button onClick={handleSubmit}>Create</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EditAuthorDialog({ author, onAuthorUpdated }: { author: any; onAuthorUpdated: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(author.name);
    const [bio, setBio] = useState(author.bio || "");

    const handleSubmit = async () => {
        try {
            await apiFetch(`/authors/${author.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name,
                    bio: bio || null,
                }),
            });
            setOpen(false);
            onAuthorUpdated();
        } catch (err) {
            console.error("Failed to update author:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Author</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                    <Label>Bio</Label>
                    <Input value={bio} onChange={(e) => setBio(e.target.value)} />
                    <Button onClick={handleSubmit}>Update</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

async function deleteAuthor(authorId: string, onDeleted: () => void) {
    try {
        await apiFetch(`/authors/${authorId}`, { method: "DELETE" });
        onDeleted();
    } catch (err) {
        console.error("Failed to delete author:", err);
    }
}
