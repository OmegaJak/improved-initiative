import { Listable } from "../../common/Listable";
import { KeyValueSet } from "../../common/Toolbox";
import { Listing, ListingOrigin } from "./Listing";

export function DedupeByRankAndFilterListings<T extends Listing<Listable>>(parentSubset: T[], filter: string) {
    const byName: T[] = [];
    const bySearchHint: T[] = [];
    const dedupedStatBlocks: KeyValueSet<T> = {};
    const sourceRankings: ListingOrigin[] = ["account", "localStorage", "server"];

    parentSubset.forEach(newListing => {
        const dedupeKey = newListing.Path + "-" + newListing.Name;
        const currentListing = dedupedStatBlocks[dedupeKey];
        if (currentListing) {
            const hasBetterSource = (sourceRankings.indexOf(newListing.Origin) < sourceRankings.indexOf(currentListing.Origin));
            if (hasBetterSource) {
                dedupedStatBlocks[dedupeKey] = newListing;
            }
        } else {
            dedupedStatBlocks[dedupeKey] = newListing;
        }
    });

    Object.keys(dedupedStatBlocks).sort().forEach(i => {
        const listing = dedupedStatBlocks[i];
        if (listing.Name.toLocaleLowerCase().indexOf(filter) > -1) {
            byName.push(listing);
        }
        else if (listing.SearchHint.toLocaleLowerCase().indexOf(filter) > -1) {
            bySearchHint.push(listing);
        }
    });

    return byName.concat(bySearchHint);
}

export class FilterCache<T extends Listing<Listable>> {
    constructor(private allItems: T[]) {
        
    }

    private filterCache: KeyValueSet<T[]> = {};
    
    public GetFilteredEntries = (filter: string) => {
        if (this.filterCache[filter]) {
            return this.filterCache[filter];
        }

        const parentSubset = this.filterCache[filter.substr(0, filter.length - 1)] || this.allItems;

        const finalList = DedupeByRankAndFilterListings(parentSubset, filter);

        this.filterCache[filter] = finalList;

        return finalList;
    }
}