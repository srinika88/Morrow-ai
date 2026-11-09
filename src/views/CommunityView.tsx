import React, { useState } from 'react';
import {
  Users,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  PlusCircle,
  Shield,
  Flag,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { CommunityPost, UserProfile } from '../types/index.js';
import confetti from 'canvas-confetti';

interface CommunityViewProps {
  posts: CommunityPost[];
  profile: UserProfile | null;
  onRefresh: () => void;
}

const CATEGORIES: CommunityPost['category'][] = [
  'Everyday wellbeing',
  'Chronic illness',
  'Chronic pain',
  'Autoimmune health',
  'Digestive health',
  'Fatigue',
  'Undiagnosed symptoms'
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  profile,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [reportModalPost, setReportModalPost] = useState<CommunityPost | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['category']>('Fatigue');
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);
  const [newTags, setNewTags] = useState('Pacing, Spoons, DailyWins');
  const [submitting, setSubmitting] = useState(false);

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleReact = async (postId: string, type: 'heart' | 'relate' | 'hug') => {
    try {
      await api.reactToPost(postId, type);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      await api.commentOnPost(postId, commentText.trim(), isAnonymousComment);
      setCommentText('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setSubmitting(true);
    try {
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await api.createCommunityPost({
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
        authorName: isAnonymousPost ? 'Anonymous Member' : profile?.name || 'Morrow Member',
        isAnonymous: isAnonymousPost,
        tags: tagsArray
      });

      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#DCD5F2', '#FAF8F3', '#574665']
        });
      } catch (e) {}

      setShowCreateModal(false);
      setNewTitle('');
      setNewBody('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error creating post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportPost = () => {
    setReportSuccess(true);
    setTimeout(() => {
      setReportModalPost(null);
      setReportSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-[#35313A]">
            Community & Supportive Circles
          </h2>
          <p className="text-sm text-[#686270] mt-1">
            A quiet, compassionate space to share gentle wins, pacing reflections, and lived experiences.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 rounded-xl bg-[#574665] text-[#FAF8F3] font-medium text-sm flex items-center gap-2 hover:bg-[#3E324A] transition-colors self-start sm:self-auto shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discussion Post</span>
        </button>
      </div>

      {/* Community Guidelines banner */}
      <div className="p-4 rounded-2xl bg-[#DCE7D8]/40 border border-[#DCE7D8] flex items-center gap-3 text-xs text-[#35313A]">
        <Shield className="w-4 h-4 text-emerald-800 shrink-0" />
        <span>
          <strong>Safe Space Guarantee:</strong> We honor spoon theory, invisible illnesses, and neurodiversity. No unsolicited medical cures or toxic positivity.
        </span>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#574665] text-white shadow-xs'
              : 'bg-white border border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
          }`}
        >
          All Discussions
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#574665] text-white shadow-xs'
                : 'bg-white border border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#686270] bg-white rounded-3xl border border-[#35313A]/10">
            No posts found in this circle yet. Start the conversation!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = activeCommentPostId === post.id;

            return (
              <div
                key={post.id}
                className="p-6 rounded-3xl bg-white border border-[#35313A]/10 shadow-xs space-y-4 hover:border-[#574665]/20 transition-all"
              >
                {/* Author & Category Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {post.isAnonymous || !post.authorAvatar ? (
                      <div className="w-9 h-9 rounded-full bg-[#EEE9F7] text-[#574665] flex items-center justify-center text-xs font-semibold">
                        M
                      </div>
                    ) : (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#35313A]/10"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#35313A]">
                        {post.authorName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#9B94A4]">
                        <span className="text-[#574665] font-medium">
                          {post.category}
                        </span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setReportModalPost(post)}
                    className="p-1.5 text-[#9B94A4] hover:text-[#35313A] rounded-lg"
                    title="Report post"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-semibold text-[#35313A] leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#686270] leading-relaxed whitespace-pre-wrap">
                    {post.body}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-[#686270] bg-[#FAF8F3] px-2 py-0.5 rounded-md border border-[#35313A]/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reactions & Comment Bar */}
                <div className="pt-3 border-t border-[#35313A]/5 flex items-center justify-between">
                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReact(post.id, 'heart')}
                      className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl border transition-all ${
                        post.userReaction === 'heart'
                          ? 'bg-[#EEE9F7] text-[#574665] border-[#574665] font-semibold'
                          : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <span>🤍</span>
                      <span>{post.reactions.heart}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, 'relate')}
                      className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl border transition-all ${
                        post.userReaction === 'relate'
                          ? 'bg-[#EEE9F7] text-[#574665] border-[#574665] font-semibold'
                          : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <span>🤝 I Relate</span>
                      <span>{post.reactions.relate}</span>
                    </button>

                    <button
                      onClick={() => handleReact(post.id, 'hug')}
                      className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl border transition-all ${
                        post.userReaction === 'hug'
                          ? 'bg-[#EEE9F7] text-[#574665] border-[#574665] font-semibold'
                          : 'bg-white border-[#35313A]/10 text-[#686270] hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <span>🫂 Support</span>
                      <span>{post.reactions.hug}</span>
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setActiveCommentPostId(isCommentsOpen ? null : post.id)
                    }
                    className="flex items-center gap-1.5 text-xs text-[#686270] hover:text-[#35313A]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} comments</span>
                  </button>
                </div>

                {/* Comment Section (Accordion) */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-[#35313A]/5 space-y-4">
                    {/* Comments list */}
                    <div className="space-y-3">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-[#9B94A4] italic">
                          No replies yet. Be the first to share your thoughts!
                        </p>
                      ) : (
                        post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#35313A]/5 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#35313A]">
                                {comm.authorName}
                              </span>
                              <span className="text-[10px] text-[#9B94A4]">
                                {new Date(comm.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[#686270] leading-relaxed">
                              {comm.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* New Comment Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a supportive reply..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A] focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-[#574665] text-white hover:bg-[#3E324A] transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[#686270] flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnonymousComment}
                            onChange={(e) => setIsAnonymousComment(e.target.checked)}
                            className="rounded accent-[#574665]"
                          />
                          <span>Reply anonymously</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FAF8F3] rounded-3xl p-6 border border-[#35313A]/10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#35313A]/10 pb-3">
              <h3 className="font-serif text-xl font-semibold text-[#35313A]">
                Create Discussion Post
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[#686270] hover:bg-[#EEE9F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Circle / Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Small victories this week, or tips for doctor prep"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Your Reflection or Question *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share what is on your mind. Remember that gentle authenticity is welcomed here."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686270] uppercase mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Pacing, Migraine, Rest, DoctorPrep"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#35313A]/15 bg-white text-[#35313A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonPost"
                  checked={isAnonymousPost}
                  onChange={(e) => setIsAnonymousPost(e.target.checked)}
                  className="rounded accent-[#574665]"
                />
                <label htmlFor="anonPost" className="text-xs text-[#35313A] cursor-pointer">
                  Post anonymously as <strong>Morrow Member</strong>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#574665] text-white text-xs font-medium hover:bg-[#3E324A] transition-colors"
                >
                  {submitting ? 'Publishing...' : 'Share with Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Post Modal */}
      {reportModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#35313A]/40 backdrop-blur-xs"
            onClick={() => setReportModalPost(null)}
          />
          <div className="relative w-full max-w-sm bg-[#FAF8F3] rounded-3xl p-6 border border-[#35313A]/10 shadow-2xl z-10 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#35313A]">
              Report Post to Moderators
            </h3>
            <p className="text-xs text-[#686270]">
              Our community is actively moderated for safe, non-judgmental health discourse.
            </p>
            {reportSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl">
                Thank you. This post has been flagged for swift moderation review.
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleReportPost}
                  className="w-full py-2 px-3 text-left text-xs bg-white rounded-xl border border-[#35313A]/10 hover:bg-[#EEE9F7]"
                >
                  Unsolicited medical advice / unproven cure claims
                </button>
                <button
                  onClick={handleReportPost}
                  className="w-full py-2 px-3 text-left text-xs bg-white rounded-xl border border-[#35313A]/10 hover:bg-[#EEE9F7]"
                >
                  Harassment or dismissive invalidation
                </button>
                <button
                  onClick={handleReportPost}
                  className="w-full py-2 px-3 text-left text-xs bg-white rounded-xl border border-[#35313A]/10 hover:bg-[#EEE9F7]"
                >
                  Spam or commercial promotion
                </button>
                <button
                  onClick={() => setReportModalPost(null)}
                  className="w-full py-2 text-xs text-[#9B94A4] hover:text-[#35313A]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
