<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep initial explanation generation in the authenticated server function with the direct Gemini client; keep saved-explanation follow-ups in an authenticated streaming server route using AI Gateway, so keys and context stay server-side.
- Store question/answer pairs per saved explanation with owner-scoped RLS and cascade deletion; replay plain text conversation history to avoid provider-held state.
- Persist provider access denials in Cloud and require confirmed access restoration before removing a block; never retry denied requests automatically.
