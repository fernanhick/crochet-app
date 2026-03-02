import { query } from '../_generated/server';
import { v } from 'convex/values';

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId))
      .first();
  },
});

export const getPatternsByUser = query({
  args: {
    clerkId:    v.string(),
    typeFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Resolve clerkId → userId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId))
      .first();

    if (!user) return [];

    const patterns = await ctx.db
      .query('patterns')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .order('desc')
      .collect();

    if (args.typeFilter && args.typeFilter !== 'all') {
      return patterns.filter(p => p.metadata.type === args.typeFilter);
    }
    return patterns;
  },
});

export const getPatternById = query({
  args: { id: v.id('patterns') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
