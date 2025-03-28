'use client';

import { useLayoutEffect, useEffect } from 'react';

// This hook safely handles the useLayoutEffect warning during SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect; 