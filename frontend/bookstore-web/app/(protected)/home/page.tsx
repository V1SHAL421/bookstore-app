"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getJSON, getUser } from "@/app/utils";
import { bookSchema } from "@/app/schema";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function HomePage() {
    const router = useRouter();

    // type TokenResponse = {
    //     access_token: string;
    //     refresh_token: string;
    //     token_type: "bearer";
    //     user: {
    //         id: string;
    //         email: string;
    //         full_name: string;
    //     };
    // };

    type BookResponse = ReturnType<typeof bookSchema.parse>;

    const [books, setBooks] = useState<BookResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<number | null>(null);

    useEffect(() => {
        const user = getUser();
        if (user?.role === 'admin') {
            router.push('/admin');
        }
    }, [router]);

    const filteredBooks = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return books.filter((book) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                book.title.toLowerCase().includes(normalizedSearch) ||
                (book.description?.toLowerCase().includes(normalizedSearch) ?? false) ||
                book.author_name.toLowerCase().includes(normalizedSearch);
            const matchesPrice = maxPrice == null || book.price <= maxPrice;
            return matchesSearch && matchesPrice;
        });
    }, [books, searchTerm, maxPrice]);

    const columns: ColumnDef<BookResponse>[] = [
        {
          accessorKey: "title",
          header: "Title",
          cell: ({ getValue, row }) => (
            <Link href={`/book/${row.original.id}`} className="text-blue-600 hover:underline">
              {getValue<string>()}
            </Link>
          ),
        },
        {
          accessorKey: "description",
          header: "Description",
        },
        {
          accessorKey: "author_name",
          header: "Author",
          cell: ({ getValue, row }) => (
            <Link href={`/author/${row.original.author_id}`} className="text-blue-600 hover:underline">
              {getValue<string>()}
            </Link>
          ),
        },
        {
          accessorKey: "price",
          header: "Price",
          cell: ({ getValue }) => `${getValue<number>().toFixed(2)}`,
        },
        {
          accessorKey: "published_date",
          header: "Published Date",
          cell: ({ getValue }) => {
            const value = getValue<string | null>();
            return value ? new Date(value).toLocaleDateString() : "-";
          },
        },
      ];

    const table = useReactTable({
        data: filteredBooks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        });


    useEffect(() => {
        let isMounted = true;

        const loadBooks = async () => {
            try {
                const response = await getJSON<BookResponse[]>("/books");
                console.log("Books loaded:", response);
                if (isMounted) {
                    setBooks(response);
                }
            } catch (err) {
                console.error("Failed to load books:", err);
                if (isMounted) {
                    setError("Failed to load books. Please try again.");
                }
            }
        };

        loadBooks();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            {error ? <p>{error}</p> : null}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="text-sm font-medium" htmlFor="book-search">
                        Search
                    </label>
                    <Input
                        id="book-search"
                        placeholder="Search by title, description, or author"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <div className="w-full sm:w-40">
                    <label className="text-sm font-medium" htmlFor="book-max-price">
                        Max price
                    </label>
                    <Input
                        id="book-max-price"
                        placeholder="No limit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxPrice ?? ""}
                        onChange={(event) => {
                            const value = event.target.value;
                            setMaxPrice(value === "" ? null : Number(value));
                        }}
                    />
                </div>
            </div>
            <Table>
                <TableCaption>Available Books</TableCaption>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                No books available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
