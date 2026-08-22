/* TalentKenya Blog Post — reading view with related posts. */
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BLOG } from "@/lib/data";
import { PublicLayout } from "@/components/Layout";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = BLOG.find(p => p.id === id);
  const others = BLOG.filter(p => p.id !== id).slice(0, 3);

  if (!post) {
    return (
      <PublicLayout>
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Article not found.</p>
        <Link href="/blog" className="btn-press px-5 py-2.5 rounded-md bg-[#166534] text-white text-sm font-semibold">All articles</Link>
      </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <div className="container py-8 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Career insights
      </Link>
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-[#e0f2e9] text-[#14532d]`}>{post.category}</span>
      <h1 className="font-heading text-3xl md:text-4xl font-bold mt-3 leading-tight">{post.title}</h1>
      <p className="text-sm text-muted-foreground mt-3 flex items-center gap-3">
        <span>{post.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readMin} min read</span>
      </p>
      <p className="text-base text-foreground/80 leading-relaxed mt-6 font-medium">{post.excerpt}</p>
      <article className="mt-6 space-y-4">
        {post.body.map((para, i) => <p key={i} className="text-sm text-foreground/85 leading-relaxed">{para}</p>)}
      </article>
      <div className="border-t border-border mt-10 pt-6">
        <p className="font-heading font-bold mb-3">More to read</p>
        <div className="flex flex-col gap-3">
          {others.map(p => (
            <Link key={p.id} href={`/blog/${p.id}`} className="group flex items-center justify-between bg-card rounded-md border border-border p-4 hover:shadow-md transition-all">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{p.category}</p>
                <p className="font-semibold text-sm mt-0.5 group-hover:text-[#166534] transition-colors">{p.title}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#166534] shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
