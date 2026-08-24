import PostForm from "@/components/admin/PostForm";

export const metadata = {
  title: "New Journal Post | Khayal Admin",
};

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-parchment text-2xl font-medium">New Journal Post</h1>
      <PostForm />
    </div>
  );
}
