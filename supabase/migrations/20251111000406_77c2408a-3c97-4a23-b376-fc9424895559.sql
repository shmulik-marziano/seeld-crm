-- Add DELETE policy for users to delete their own policies
CREATE POLICY "Users can delete their own policies" 
ON public.policies 
FOR DELETE 
USING (auth.uid() = user_id);