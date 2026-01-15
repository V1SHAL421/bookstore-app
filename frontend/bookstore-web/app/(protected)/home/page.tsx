"use client";

import { useEffect, useMemo, useState } from "react";
import { getJSON, getUser } from "@/app/utils";
import { bookSchema } from "@/app/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/CartContext";
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
    const { addItem } = useCart();

    type BookResponse = ReturnType<typeof bookSchema.parse>;

    const [books, setBooks] = useState<BookResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

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

    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
    const pagedBooks = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredBooks.slice(start, start + pageSize);
    }, [filteredBooks, page]);

    const columns: ColumnDef<BookResponse>[] = [
        {
          accessorKey: "title",
          header: "Title",
          cell: ({ getValue, row }) => (
            <button
              onClick={() => router.push(`/book/${row.original.id}`)}
              className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              <span className="text-lg font-semibold text-gray-900">
                {getValue<string>()}
              </span>
            </button>
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
            <button
              onClick={() => router.push(`/author/${row.original.author_id}`)}
              className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {getValue<string>()}
            </button>
          ),
        },
        {
          accessorKey: "price",
          header: "Price",
          cell: ({ getValue }) => `£${getValue<number>().toFixed(2)}`,
        },
        {
          accessorKey: "published_date",
          header: "Published Date",
          cell: ({ getValue }) => {
            const value = getValue<string | null>();
            return value ? new Date(value).toLocaleDateString() : "-";
          },
        },
        {
          id: "add_to_cart",
          header: "Add",
          cell: ({ row }) => (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  addItem({
                    id: row.original.id,
                    title: row.original.title,
                    price: row.original.price,
                  });
                }}
                aria-label={`Add ${row.original.title} to cart`}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ];

    const table = useReactTable({
        data: pagedBooks,
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
            <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-gray-500">Catalog</p>
                <div className="mt-2">
                    <h1 className="text-2xl font-semibold text-gray-900">Available Books</h1>
                </div>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="text-sm font-medium" htmlFor="book-search">
                        Search
                    </label>
                    <Input
                        id="book-search"
                        placeholder="Search by title, description, or author"
                        value={searchTerm}
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setPage(1);
                        }}
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
                            setPage(1);
                        }}
                    />
                </div>
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className={
                                        header.column.id === "title"
                                            ? "border-l-4 border-gray-900 pl-3 font-semibold text-gray-900"
                                            : header.column.id === "add_to_cart"
                                            ? "text-right"
                                            : undefined
                                    }
                                >
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
            <div className="mt-4 flex items-center justify-end gap-3">
                <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
