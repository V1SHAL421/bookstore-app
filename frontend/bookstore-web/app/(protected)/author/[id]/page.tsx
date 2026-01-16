"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJSON } from "@/app/utils";
import { useBreadcrumb } from "@/app/BreadcrumbContext";
import { HeroSkeleton } from "@/components/ui/hero-skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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

type AuthorResponse = {
    id: string;
    name: string;
    bio: string | null;
    books: {
        id: string;
        title: string;
        author_id: string;
        description: string | null;
        price: number;
        published_date: string | null;
    }[];
};

function AuthorHeader({ author }: { author: AuthorResponse }) {
  return (
    <Card className="mb-4 md:mb-6">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {author.name}
        </CardTitle>

        {author.bio && (
          <CardDescription className="mt-4 max-w-2xl mx-auto text-base">
            {author.bio}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

export default function AuthorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const authorId = params.id as string;
    const { setTitle } = useBreadcrumb();

    const [author, setAuthor] = useState<AuthorResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadAuthor = async () => {
            try {
                const response = await getJSON<AuthorResponse>(`/authors/${authorId}`);
                if (isMounted) {
                    setAuthor(response);
                    setTitle(response.name);
                }
            } catch (err) {
                console.error("Failed to load author:", err);
                if (isMounted) {
                    setError("Failed to load author details. Please try again.");
                }
            }
        };

        if (authorId) {
            loadAuthor();
        }

        return () => {
            isMounted = false;
        };
    }, [authorId]);

    const columns = useMemo<ColumnDef<AuthorResponse['books'][0]>[]>(() => [
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
      ], []);

    const table = useReactTable({
        data: author?.books || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
      });

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <section className="min-h-[32vh] md:min-h-[45vh]">
                {author ? <AuthorHeader author={author} /> : <HeroSkeleton />}
            </section>
            {author && (
                <>
                    <div className="mb-3 md:mb-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Books by {author.name}</h1>
                        <p className="text-sm text-gray-600 mt-2">Select a book to view details or add it to your cart.</p>
                    </div>
                    <Table>
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
                    <button
                      onClick={() => router.push("/home")}
                      className="block mt-4 text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Continue Browsing
                    </button>
                </>
            )}
        </div>
    );
}
