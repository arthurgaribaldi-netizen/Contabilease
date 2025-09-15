/**
 * @copyright 2025 Contabilease. All rights reserved.
 * @license Proprietary - See LICENSE.txt
 * @author Arthur Garibaldi <arthurgaribaldi@gmail.com>
 * 
 * This file contains proprietary Contabilease software components.
 * Unauthorized copying, distribution, or modification is prohibited.
 */

import { ifrs16Cache } from '@/lib/cache/ifrs16-cache';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API para gerenciamento do cache de cálculos IFRS 16
 */

// GET /api/cache/ifrs16 - Obter estatísticas do cache
export async function GET(_request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = ifrs16Cache.getStats();
    const cacheInfo = ifrs16Cache.getCacheInfo();

    return NextResponse.json({
      stats,
      cache_entries: cacheInfo,
      total_entries: cacheInfo.length,
      valid_entries: cacheInfo.filter(entry => entry.isValid).length,
      expired_entries: cacheInfo.filter(entry => !entry.isValid).length,
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cache/ifrs16 - Limpar cache
export async function DELETE(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');

    if (contractId) {
      // Limpar cache de um contrato específico
      const deletedCount = ifrs16Cache.deleteContract(contractId);
      return NextResponse.json({
        message: `Cache cleared for contract ${contractId}`,
        deleted_entries: deletedCount,
      });
    } else {
      // Limpar todo o cache
      const stats = ifrs16Cache.getStats();
      ifrs16Cache.clear();
      return NextResponse.json({
        message: 'All cache cleared',
        previous_stats: stats,
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cache/ifrs16/cleanup - Limpeza manual de entradas expiradas
export async function POST(request: NextRequest) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      const cleanedCount = ifrs16Cache.cleanup();
      const stats = ifrs16Cache.getStats();

      return NextResponse.json({
        message: 'Cache cleanup completed',
        cleaned_entries: cleanedCount,
        current_stats: stats,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error performing cache action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
