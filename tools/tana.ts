/**
 * Tana Supertag CLI wrapper tools
 * Credits to Jens-Christian Fischer
 * Requires: https://github.com/jcfischer/supertag-cli
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SUPERTAG_PATH = process.env.SUPERTAG_PATH || 'supertag';

export interface TanaSearchResult {
    results: string;
    error?: string;
}

export interface TanaNodeResult {
    content: string;
    error?: string;
}

/**
 * Semantic or keyword search the Tana workspace
 */
export async function tanaSearch(query: string, tag?: string, semantic = false): Promise<TanaSearchResult> {
    try {
        let cmd = `${SUPERTAG_PATH} search "${query}"`;
        if (semantic) {
            cmd += ' --semantic';
        }
        if (tag) {
            cmd += ` --tag ${tag}`;
        }

        const { stdout, stderr } = await execAsync(cmd);

        if (stderr) {
            return { results: '', error: stderr };
        }

        return { results: stdout };
    } catch (error) {
        return { results: '', error: String(error) };
    }
}

/**
 * Get details of a specific Tana node by ID
 */
export async function tanaNodeShow(nodeId: string): Promise<TanaNodeResult> {
    try {
        const cmd = `${SUPERTAG_PATH} nodes show ${nodeId}`;

        const { stdout, stderr } = await execAsync(cmd);

        if (stderr) {
            return { content: '', error: stderr };
        }

        return { content: stdout };
    } catch (error) {
        return { content: '', error: String(error) };
    }
}
