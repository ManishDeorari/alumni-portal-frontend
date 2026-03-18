"use client";
import React from "react";
import MemberSearchModal from "./MemberSearchModal";

export default function InviteMembersModal({ isOpen, onClose, onInvite, groupId, existingMemberIds = [] }) {
    if (!isOpen) return null;

    const handleSelect = (selectedIds) => {
        onInvite(groupId, { userIds: selectedIds });
    };

    return (
        <MemberSearchModal
            isOpen={isOpen}
            onClose={onClose}
            onSelect={handleSelect}
            title="Invite New Members"
            multiSelect={true}
            excludeIds={existingMemberIds}
        />
    );
}
