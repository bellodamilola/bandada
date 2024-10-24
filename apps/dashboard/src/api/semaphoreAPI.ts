import { SemaphoreSubgraph } from "@semaphore-protocol/data"
import { Group } from "../types"
import parseGroupName from "../utils/parseGroupName"
import { getGroupByName } from "./bandadaAPI"

const ETHEREUM_NETWORK = import.meta.env.VITE_ETHEREUM_NETWORK

const subgraph = new SemaphoreSubgraph(ETHEREUM_NETWORK)

/**
 * It returns the Semaphore on-chain groups for a specific admin.
 * @param adminAddress The admin address.
 * @returns The list of groups.
 */
export async function getGroups(adminAddress: string): Promise<Group[] | null> {
    try {
        const groups = await subgraph.getGroups({
            members: true,
            filters: { admin: adminAddress }
        })

        return groups.map((group) => {
            const groupName = parseGroupName(group.id)

            return {
                id: group.id,
                name: groupName,
                treeDepth: group.merkleTree.depth,
                members: group.members as string[],
                admin: group.admin as string,
                type: "on-chain"
            }
        })
    } catch (error) {
        console.error(error)

        return null
    }
}

/**
 * It returns details of a specific on-chain group.
 * @param groupId The group id.
 * @returns The group details.
 */
export async function getGroup(groupId: string): Promise<Group | null> {
    try {
        const group = await subgraph.getGroup(groupId, {
            members: true
        })

        return {
            id: group.id,
            name: parseGroupName(group.id),
            treeDepth: group.merkleTree.depth,
            fingerprintDuration: 3600,
            members: group.members as string[],
            admin: group.admin as string,
            type: "on-chain"
        }
    } catch (error) {
        console.error(error)

        return null
    }
}

/**
 * It returns the details of a specific on-chain group together with the associated off-chain group details.
 * @param groupId
 * @returns The group details.
 */
export async function getAssociatedGroup(
    groupId: string
): Promise<Group | null> {
    try {
        const group = await subgraph.getGroup(groupId, {
            members: true
        })

        const members = group.members as string[]
        const bandadaGroup = await getGroupByName(group.id, "on-chain")

        if (bandadaGroup && bandadaGroup.length > 0) {
            members.push(...bandadaGroup[0].members)
        }

        return {
            id: group.id,
            name: parseGroupName(group.id),
            treeDepth: group.merkleTree.depth,
            fingerprintDuration: 3600,
            members,
            admin: group.admin as string,
            type: "on-chain"
        }
    } catch (error) {
        console.error(error)

        return null
    }
}
